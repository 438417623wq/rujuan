package com.rujuanMG.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class NativeAiStreamService extends Service {
    public static final String ACTION_START = "com.rujuanMG.app.action.START_NATIVE_AI_STREAM";
    public static final String ACTION_CANCEL = "com.rujuanMG.app.action.CANCEL_NATIVE_AI_STREAM";
    public static final String EXTRA_PAYLOAD_JSON = "payload_json";
    public static final String EXTRA_SESSION_ID = "session_id";

    private static final String CHANNEL_ID = "airp_ai_reply";
    private static final int NOTIFICATION_ID = 2001;
    private static final int CONNECT_TIMEOUT_MS = 60000;
    private static final int READ_TIMEOUT_MS = 180000;
    private static final int MAX_RETRY_ATTEMPTS = 2;
    private static final long RETRY_BASE_DELAY_MS = 1500L;
    private static final long WAKE_LOCK_TIMEOUT_MS = 30 * 60 * 1000L;
    private static volatile NativeAiStreamService activeInstance;

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean cancelRequested = new AtomicBoolean(false);

    private volatile HttpURLConnection activeConnection;
    private volatile BufferedReader activeReader;
    private volatile String activeSessionId;
    private volatile long lastNotificationUpdateAt;
    private volatile PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        activeInstance = this;
    }

    public static boolean requestCancel(android.content.Context context, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return false;
        }

        NativeAiStreamService service = activeInstance;
        if (service != null) {
            service.cancelSession(sessionId);
            return true;
        }

        markSessionCancelled(context, sessionId);
        return true;
    }

    public static void markSessionCancelled(android.content.Context context, String sessionId) {
        if (context == null || sessionId == null || sessionId.isBlank()) {
            return;
        }

        JSONObject cancelled = buildCancelledState(context, sessionId);
        NativeAiStreamStore.writeState(context, cancelled);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (ACTION_CANCEL.equals(action)) {
            handleCancel(intent.getStringExtra(EXTRA_SESSION_ID), startId);
            return START_NOT_STICKY;
        }

        if (!ACTION_START.equals(action)) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }

        String payloadJson = intent.getStringExtra(EXTRA_PAYLOAD_JSON);
        if (payloadJson == null || payloadJson.isBlank()) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }

        JSONObject payload;
        try {
            payload = new JSONObject(payloadJson);
        } catch (JSONException e) {
            stopSelf(startId);
            return START_NOT_STICKY;
        }

        ensureChannel();

        String sessionId = payload.optString("sessionId", UUID.randomUUID().toString());
        payload.remove("sessionId");
        try {
            payload.put("sessionId", sessionId);
        } catch (JSONException ignored) {
        }

        activeSessionId = sessionId;
        cancelRequested.set(false);
        lastNotificationUpdateAt = 0L;
        acquireWakeLock();
        NativeAiStreamStore.writeState(
                this,
                buildBaseState(
                        sessionId,
                        payload.optString("conversationId"),
                        payload.optString("conversationTitle"),
                        payload.optString("aiMsgId")
                )
        );
        startForeground(
                NOTIFICATION_ID,
                buildOngoingNotification(
                        sessionId,
                        payload.optString("conversationTitle"),
                        getString(R.string.notification_ai_background_running),
                        "",
                        true
                )
        );

        executor.submit(() -> runStream(payload, startId));
        return START_REDELIVER_INTENT;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (activeInstance == this) {
            activeInstance = null;
        }
        cancelRequested.set(true);
        closeActiveConnection();
        releaseWakeLock();
        executor.shutdownNow();
        super.onDestroy();
    }

    private void handleCancel(String sessionId, int startId) {
        if (sessionId == null || sessionId.isBlank()) {
            stopSelf(startId);
            return;
        }

        boolean activeSessionCancelled = cancelSession(sessionId);
        if (activeSessionCancelled) {
            return;
        }
        stopSelf(startId);
    }

    private void runStream(JSONObject payload, int startId) {
        String sessionId = payload.optString("sessionId");
        String conversationTitle = payload.optString("conversationTitle");
        String conversationId = payload.optString("conversationId");
        String aiMsgId = payload.optString("aiMsgId");

        JSONObject state = buildBaseState(sessionId, conversationId, conversationTitle, aiMsgId);
        putStatus(state, "starting");
        NativeAiStreamStore.writeState(this, state);

        int attempt = 0;
        try {
            while (!cancelRequested.get()) {
                String fullText = "";
                JSONObject usage = createEmptyUsage();

                putStatus(state, "starting");
                putError(state, "");
                putHttpStatus(state, 0);
                putFullText(state, "");
                putUsage(state, usage);
                putUpdatedAt(state);
                NativeAiStreamStore.writeState(this, state);

                if (attempt > 0) {
                    showRetryNotification(sessionId, conversationTitle, attempt);
                }

                try {
                    JSONObject profile = payload.optJSONObject("apiProfile");
                    if (profile == null) {
                        throw new IOException("Missing API profile");
                    }

                    String model = payload.optString("model", "");
                    String systemPrompt = payload.optString("systemPrompt", "");
                    JSONArray messages = payload.optJSONArray("messages");
                    if (messages == null) {
                        messages = new JSONArray();
                    }

                    String provider = detectProvider(profile, model);
                    String url = buildUrl(profile, model, true);
                    JSONObject requestBody = buildBody(profile, provider, model, systemPrompt, messages, true);

                    HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
                    activeConnection = connection;
                    connection.setRequestMethod("POST");
                    connection.setDoInput(true);
                    connection.setDoOutput(true);
                    connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
                    connection.setReadTimeout(READ_TIMEOUT_MS);
                    setHeaders(connection, profile, provider);

                    byte[] bodyBytes = requestBody.toString().getBytes(StandardCharsets.UTF_8);
                    try (OutputStream os = connection.getOutputStream()) {
                        os.write(bodyBytes);
                    }

                    int statusCode = connection.getResponseCode();
                    if (statusCode < 200 || statusCode >= 300) {
                        String errorText = readFully(connection.getErrorStream());
                        throw new HttpStatusException(statusCode, extractErrorMessage(errorText, statusCode));
                    }

                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                        activeReader = reader;
                        String line;
                        long startedAt = System.currentTimeMillis();
                        while (!cancelRequested.get() && (line = reader.readLine()) != null) {
                            if (line.isBlank() || !line.startsWith("data: ")) {
                                continue;
                            }

                            String raw = line.substring(6).trim();
                            if (raw.isBlank() || "[DONE]".equals(raw)) {
                                continue;
                            }

                            JSONObject event;
                            try {
                                event = new JSONObject(raw);
                            } catch (JSONException ignored) {
                                continue;
                            }

                            if (event.has("error")) {
                                throw new IOException(extractErrorFromEvent(event));
                            }

                            String chunk = extractChunk(provider, event, usage);
                            if (!chunk.isEmpty()) {
                                fullText += chunk;
                                putStatus(state, "streaming");
                                putFullText(state, fullText);
                                putUsage(state, usage);
                                putUpdatedAt(state);
                                NativeAiStreamStore.writeState(this, state);
                                updateOngoingNotification(sessionId, conversationTitle, fullText, startedAt);
                            }
                        }
                    }

                    if (cancelRequested.get()) {
                        putStatus(state, "cancelled");
                        putFullText(state, fullText);
                        putUsage(state, usage);
                        putUpdatedAt(state);
                        NativeAiStreamStore.writeState(this, state);
                        showTerminalNotification(sessionId, conversationTitle, fullText, getString(R.string.notification_ai_background_cancelled));
                    } else {
                        putStatus(state, "completed");
                        putFullText(state, fullText);
                        putUsage(state, usage);
                        putUpdatedAt(state);
                        NativeAiStreamStore.writeState(this, state);
                        showTerminalNotification(
                                sessionId,
                                conversationTitle,
                                fullText,
                                getString(R.string.notification_ai_background_done)
                        );
                    }
                    return;
                } catch (HttpStatusException e) {
                    if (shouldRetryStream(e.statusCode, e.getMessage(), fullText, attempt)) {
                        attempt++;
                        waitBeforeRetry(attempt);
                        continue;
                    }
                    handleStreamException(state, sessionId, conversationTitle, fullText, usage, e.getMessage(), e.statusCode);
                    return;
                } catch (SocketTimeoutException e) {
                    if (shouldRetryStream(0, "IDLE_TIMEOUT", fullText, attempt)) {
                        attempt++;
                        waitBeforeRetry(attempt);
                        continue;
                    }
                    handleStreamException(state, sessionId, conversationTitle, fullText, usage, "IDLE_TIMEOUT", 0);
                    return;
                } catch (Exception e) {
                    if (shouldRetryStream(0, e.getMessage(), fullText, attempt)) {
                        attempt++;
                        waitBeforeRetry(attempt);
                        continue;
                    }
                    handleStreamException(state, sessionId, conversationTitle, fullText, usage, e.getMessage(), 0);
                    return;
                } finally {
                    closeActiveConnection();
                }
            }

            JSONObject usage = createEmptyUsage();
            putStatus(state, "cancelled");
            putFullText(state, "");
            putUsage(state, usage);
            putUpdatedAt(state);
            NativeAiStreamStore.writeState(this, state);
            showTerminalNotification(sessionId, conversationTitle, "", getString(R.string.notification_ai_background_cancelled));
        } finally {
            activeSessionId = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(STOP_FOREGROUND_DETACH);
            } else {
                stopForeground(false);
            }
            stopSelf(startId);
            releaseWakeLock();
        }
    }

    private void handleStreamException(
            JSONObject state,
            String sessionId,
            String conversationTitle,
            String fullText,
            JSONObject usage,
            String errorMessage,
            int httpStatus
    ) {
        if (cancelRequested.get()) {
            putStatus(state, "cancelled");
            putFullText(state, fullText);
            putUsage(state, usage);
            putUpdatedAt(state);
            NativeAiStreamStore.writeState(this, state);
            showTerminalNotification(sessionId, conversationTitle, fullText, getString(R.string.notification_ai_background_cancelled));
            return;
        }

        putStatus(state, "error");
        putFullText(state, fullText);
        putUsage(state, usage);
        putError(state, errorMessage == null ? "Unknown error" : errorMessage);
        putHttpStatus(state, httpStatus);
        putUpdatedAt(state);
        NativeAiStreamStore.writeState(this, state);
        showTerminalNotification(
                sessionId,
                conversationTitle,
                fullText,
                fullText == null || fullText.isBlank()
                        ? getString(R.string.notification_ai_background_error)
                        : getString(R.string.notification_ai_background_error)
        );
    }

    private JSONObject createEmptyUsage() {
        JSONObject usage = new JSONObject();
        try {
            usage.put("input", 0);
            usage.put("output", 0);
        } catch (JSONException ignored) {
        }
        return usage;
    }

    private boolean cancelSession(String sessionId) {
        markSessionCancelled(this, sessionId);
        if (sessionId.equals(activeSessionId)) {
            cancelRequested.set(true);
            closeActiveConnection();
            return true;
        }
        return false;
    }

    private JSONObject readExistingState(String sessionId) {
        String raw = NativeAiStreamStore.readState(this, sessionId);
        if (raw != null && !raw.isBlank()) {
            try {
                return new JSONObject(raw);
            } catch (JSONException ignored) {
            }
        }
        return buildBaseState(sessionId, "", "", "");
    }

    private static JSONObject buildCancelledState(android.content.Context context, String sessionId) {
        JSONObject cancelled;
        String raw = NativeAiStreamStore.readState(context, sessionId);
        if (raw != null && !raw.isBlank()) {
            try {
                cancelled = new JSONObject(raw);
            } catch (JSONException ignored) {
                cancelled = new JSONObject();
            }
        } else {
            cancelled = new JSONObject();
        }

        try {
            if (!cancelled.has("sessionId")) cancelled.put("sessionId", sessionId);
            if (!cancelled.has("conversationId")) cancelled.put("conversationId", "");
            if (!cancelled.has("conversationTitle")) cancelled.put("conversationTitle", "");
            if (!cancelled.has("aiMsgId")) cancelled.put("aiMsgId", "");
            if (!cancelled.has("fullText")) cancelled.put("fullText", "");
            if (!cancelled.has("usage")) cancelled.put("usage", new JSONObject().put("input", 0).put("output", 0));
            cancelled.put("status", "cancelled");
            cancelled.put("error", "");
            cancelled.put("httpStatus", 0);
            cancelled.put("updatedAt", System.currentTimeMillis());
        } catch (JSONException ignored) {
        }

        return cancelled;
    }

    private boolean shouldRetryStream(int httpStatus, String errorMessage, String fullText, int attempt) {
        if (cancelRequested.get() || attempt >= MAX_RETRY_ATTEMPTS) {
            return false;
        }
        if (httpStatus == 408 || httpStatus == 409 || httpStatus == 429 || httpStatus >= 500) {
            return true;
        }
        String normalized = errorMessage == null ? "" : errorMessage.toLowerCase(Locale.US);
        return normalized.contains("timeout")
                || normalized.contains("idle_timeout")
                || normalized.contains("unexpected end")
                || normalized.contains("connection reset")
                || normalized.contains("broken pipe")
                || normalized.contains("eof");
    }

    private void waitBeforeRetry(int attempt) {
        long delayMs = Math.min(RETRY_BASE_DELAY_MS * (1L << Math.max(0, attempt - 1)), 8000L);
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void showRetryNotification(String sessionId, String conversationTitle, int attempt) {
        NotificationManagerCompat.from(this).notify(
                NOTIFICATION_ID,
                buildOngoingNotification(
                        sessionId,
                        conversationTitle,
                        getString(R.string.notification_ai_background_generating),
                        "",
                        true
                )
        );
    }

    private void setHeaders(HttpURLConnection connection, JSONObject profile, String provider) {
        connection.setRequestProperty("Cache-Control", "no-cache");
        connection.setRequestProperty("Connection", "keep-alive");
        for (Map.Entry<String, String> entry : buildRequestHeaders(profile, provider, "text/event-stream", true).entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            String key = entry.getKey().trim();
            String value = entry.getValue().trim();
            if (key.isEmpty() || value.isEmpty()) continue;
            connection.setRequestProperty(key, value);
        }
    }

    private JSONObject buildBody(
            JSONObject profile,
            String provider,
            String model,
            String systemPrompt,
            JSONArray messages,
            boolean stream
    ) throws JSONException {
        if ("claude".equals(provider)) {
            JSONArray mergedMessages = new JSONArray();
            String lastRole = null;
            StringBuilder lastContent = new StringBuilder();
            for (int i = 0; i < messages.length(); i++) {
                JSONObject message = messages.optJSONObject(i);
                if (message == null) {
                    continue;
                }
                String role = "assistant".equals(message.optString("role")) ? "assistant" : "user";
                String content = message.optString("content", "");
                if (role.equals(lastRole)) {
                    if (lastContent.length() > 0) {
                        lastContent.append("\n\n");
                    }
                    lastContent.append(content);
                } else {
                    if (lastRole != null) {
                        mergedMessages.put(new JSONObject()
                                .put("role", lastRole)
                                .put("content", lastContent.toString()));
                    }
                    lastRole = role;
                    lastContent = new StringBuilder(content);
                }
            }
            if (lastRole != null) {
                mergedMessages.put(new JSONObject()
                        .put("role", lastRole)
                        .put("content", lastContent.toString()));
            }
            if (mergedMessages.length() > 0 && !"user".equals(mergedMessages.optJSONObject(0).optString("role"))) {
                JSONArray fixedMessages = new JSONArray();
                fixedMessages.put(new JSONObject().put("role", "user").put("content", "(continue)"));
                for (int i = 0; i < mergedMessages.length(); i++) {
                    fixedMessages.put(mergedMessages.optJSONObject(i));
                }
                mergedMessages = fixedMessages;
            }
            JSONObject body = new JSONObject()
                    .put("model", model)
                    .put("max_tokens", maxTokensForModel(model))
                    .put("stream", stream)
                    .put("messages", mergedMessages);
            if (!systemPrompt.isBlank()) {
                body.put("system", systemPrompt);
            }
            return body;
        }

        if ("google".equals(provider)) {
            JSONArray contents = new JSONArray();
            if (!systemPrompt.isBlank()) {
                contents.put(new JSONObject()
                        .put("role", "user")
                        .put("parts", new JSONArray().put(new JSONObject().put("text", systemPrompt))));
                contents.put(new JSONObject()
                        .put("role", "model")
                        .put("parts", new JSONArray().put(new JSONObject().put("text", "OK."))));
            }
            for (int i = 0; i < messages.length(); i++) {
                JSONObject message = messages.optJSONObject(i);
                if (message == null) {
                    continue;
                }
                contents.put(new JSONObject()
                        .put("role", "assistant".equals(message.optString("role")) ? "model" : "user")
                        .put("parts", new JSONArray().put(new JSONObject().put("text", message.optString("content", "")))));
            }
            return new JSONObject().put("contents", contents);
        }

        JSONArray openAiMessages = new JSONArray();
        if (!systemPrompt.isBlank()) {
            openAiMessages.put(new JSONObject().put("role", "system").put("content", systemPrompt));
        }
        for (int i = 0; i < messages.length(); i++) {
            JSONObject message = messages.optJSONObject(i);
            if (message != null) {
                openAiMessages.put(new JSONObject()
                        .put("role", message.optString("role", "user"))
                        .put("content", message.optString("content", "")));
            }
        }
        return new JSONObject()
                .put("model", model)
                .put("messages", openAiMessages)
                .put("stream", stream)
                .put("max_tokens", maxTokensForModel(model));
    }

    private String buildUrl(JSONObject profile, String model, boolean stream) {
        String baseUrl = normalizeBaseUrl(profile);

        String detected = detectProvider(profile, model);
        if ("google".equals(detected)) {
            String apiKey = profile.optString("apiKey", "");
            String action = stream ? "streamGenerateContent?alt=sse&" : "generateContent?";
            return baseUrl + "/models/" + model + ":" + action + "key=" + apiKey;
        }
        if ("claude".equals(detected)) {
            return baseUrl + "/messages";
        }
        return baseUrl + "/chat/completions";
    }

    private String detectProvider(JSONObject profile, String model) {
        String provider = profile.optString("provider", "openai");
        if ("claude".equals(provider)) {
            return "claude";
        }
        if ("google-ai-studio".equals(provider)) {
            return "google";
        }
        String url = normalizeBaseUrl(profile).toLowerCase(Locale.US);
        if (url.contains("anthropic")) {
            return "claude";
        }
        if (url.contains("generativelanguage.googleapis")) {
            return "google";
        }
        return "openai";
    }

    private Map<String, String> buildRequestHeaders(
            JSONObject profile,
            String provider,
            String accept,
            boolean includeContentType
    ) {
        LinkedHashMap<String, String> headers = new LinkedHashMap<>();
        Map<String, String> extraHeaders = parseExtraHeaders(profile.optString("extraHeaders", ""));

        if (includeContentType) headers.put("Content-Type", "application/json");
        if (accept != null && !accept.isBlank()) headers.put("Accept", accept);

        String apiKey = profile.optString("apiKey", "").trim();
        if ("claude".equals(provider)) {
            if (!hasHeader(extraHeaders, "x-api-key") && !apiKey.isBlank()) {
                headers.put("x-api-key", apiKey);
            }
            if (!hasHeader(extraHeaders, "anthropic-version")) {
                headers.put("anthropic-version", "2023-06-01");
            }
        } else if (!"google".equals(provider)) {
            boolean hasCustomAuth = hasHeader(extraHeaders, "authorization")
                    || hasHeader(extraHeaders, "api-key")
                    || hasHeader(extraHeaders, "x-api-key");
            if (!hasCustomAuth && !apiKey.isBlank()) {
                headers.put("Authorization", "Bearer " + apiKey);
            }
        }

        headers.putAll(extraHeaders);
        return headers;
    }

    private Map<String, String> parseExtraHeaders(String raw) {
        LinkedHashMap<String, String> headers = new LinkedHashMap<>();
        String text = raw == null ? "" : raw.trim();
        if (text.isEmpty()) return headers;

        try {
            JSONObject object = new JSONObject(text);
            Iterator<String> keys = object.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object rawValue = object.opt(key);
                String value = rawValue == null ? "" : String.valueOf(rawValue).trim();
                if (!key.trim().isEmpty() && !value.isEmpty()) {
                    headers.put(key.trim(), value);
                }
            }
            return headers;
        } catch (JSONException ignored) {
        }

        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
            int separator = trimmed.indexOf(':');
            if (separator <= 0) continue;
            String key = trimmed.substring(0, separator).trim();
            String value = trimmed.substring(separator + 1).trim();
            if (!key.isEmpty() && !value.isEmpty()) {
                headers.put(key, value);
            }
        }
        return headers;
    }

    private boolean hasHeader(Map<String, String> headers, String name) {
        String target = name == null ? "" : name.toLowerCase(Locale.US);
        for (String key : headers.keySet()) {
            if (key != null && key.toLowerCase(Locale.US).equals(target)) {
                return true;
            }
        }
        return false;
    }

    private String defaultBaseUrl(String provider) {
        if ("claude".equals(provider)) return "https://api.anthropic.com/v1";
        if ("google-ai-studio".equals(provider)) return "https://generativelanguage.googleapis.com/v1beta";
        return "https://api.openai.com/v1";
    }

    private String normalizeBaseUrl(JSONObject profile) {
        String provider = profile.optString("provider", "openai");
        String rawBase = sanitizeBaseUrl(profile.optString("baseUrl", ""));
        if (rawBase.isEmpty()) return defaultBaseUrl(provider);

        try {
            URL url = new URL(rawBase);
            String path = url.getPath() == null ? "" : url.getPath().replaceAll("/+$", "");

            if ("google-ai-studio".equals(provider)) {
                if (url.getHost().toLowerCase(Locale.US).contains("generativelanguage.googleapis")
                        && !path.matches(".*/v\\d+(?:beta)?$")) {
                    path = appendPathSegment(path, "v1beta");
                }
            } else if ("claude".equals(provider)) {
                if (path.isEmpty() || path.matches(".*/(?:api|anthropic)$")) {
                    path = appendPathSegment(path, "v1");
                }
            } else if (shouldAppendDefaultVersion(path)) {
                path = appendPathSegment(path, "v1");
            }

            return buildUrlString(url, path);
        } catch (Exception ignored) {
            String value = rawBase;
            if ("google-ai-studio".equals(provider)) {
                if (!value.matches(".*/v\\d+(?:beta)?$") && value.contains("generativelanguage.googleapis")) {
                    value = value + "/v1beta";
                }
            } else if ("claude".equals(provider)) {
                if (value.matches("^https?://[^/]+$") || value.matches(".*/(?:api|anthropic)$")) {
                    value = value + "/v1";
                }
            } else {
                String path = value.replaceFirst("^https?://[^/]+", "");
                if (shouldAppendDefaultVersion(path)) {
                    value = value + "/v1";
                }
            }
            return value.replaceAll("/+$", "");
        }
    }

    private String buildUrlString(URL url, String path) {
        StringBuilder builder = new StringBuilder();
        builder.append(url.getProtocol()).append("://").append(url.getHost());
        if (url.getPort() != -1) builder.append(':').append(url.getPort());
        if (path != null && !path.isEmpty()) {
            if (!path.startsWith("/")) builder.append('/');
            builder.append(path);
        } else {
            builder.append('/');
        }
        return builder.toString().replaceAll("/+$", "");
    }

    private String sanitizeBaseUrl(String raw) {
        String value = ensureBaseUrlScheme(raw);
        if (value.isEmpty()) return "";
        int queryIndex = value.indexOf('?');
        if (queryIndex >= 0) value = value.substring(0, queryIndex);
        int hashIndex = value.indexOf('#');
        if (hashIndex >= 0) value = value.substring(0, hashIndex);
        value = value.replaceAll("/+$", "");
        value = value.replaceAll("/(?:chat/completions|responses|messages|models)$", "");
        return value.replaceAll("/+$", "");
    }

    private String ensureBaseUrlScheme(String raw) {
        String value = raw == null ? "" : raw.trim();
        if (value.isEmpty()) return "";
        if (value.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*")) return value;
        if (value.startsWith("//")) return "https:" + value;
        boolean isLocal = value.matches("^(localhost|127(?:\\.\\d{1,3}){3}|0\\.0\\.0\\.0|10(?:\\.\\d{1,3}){3}|192\\.168(?:\\.\\d{1,3}){2}|172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?::\\d+)?(?:/|$).*");
        return (isLocal ? "http://" : "https://") + value;
    }

    private boolean shouldAppendDefaultVersion(String path) {
        String clean = path == null ? "" : path.replaceAll("/+$", "");
        if (clean.isEmpty()) return true;
        if (clean.matches(".*/v\\d+(?:beta)?$")) return false;
        return clean.matches(".*/(?:api|openai)$");
    }

    private String appendPathSegment(String path, String segment) {
        String clean = path == null ? "" : path.replaceAll("/+$", "");
        return clean.isEmpty() ? "/" + segment : clean + "/" + segment;
    }

    private int maxTokensForModel(String model) {
        String value = model == null ? "" : model.toLowerCase(Locale.US);
        if (value.contains("opus-4-6") || value.contains("opus-4.6")) {
            return 128000;
        }
        if (value.contains("opus-4-1") || value.contains("opus-4.1") || value.contains("claude-3-opus")) {
            return 32000;
        }
        return 64000;
    }

    private String extractChunk(String provider, JSONObject data, JSONObject usage) throws JSONException {
        if ("claude".equals(provider)) {
            if ("content_block_delta".equals(data.optString("type"))) {
                JSONObject delta = data.optJSONObject("delta");
                return delta == null ? "" : delta.optString("text", "");
            }
            if ("message_delta".equals(data.optString("type"))) {
                JSONObject usageData = data.optJSONObject("usage");
                if (usageData != null) {
                    usage.put("output", usageData.optInt("output_tokens", usage.optInt("output", 0)));
                }
            }
            if ("message_start".equals(data.optString("type"))) {
                JSONObject message = data.optJSONObject("message");
                if (message != null) {
                    JSONObject usageData = message.optJSONObject("usage");
                    if (usageData != null) {
                        usage.put("input", usageData.optInt("input_tokens", usage.optInt("input", 0)));
                    }
                }
            }
            return "";
        }

        if ("google".equals(provider)) {
            JSONObject usageMetadata = data.optJSONObject("usageMetadata");
            if (usageMetadata != null) {
                usage.put("input", usageMetadata.optInt("promptTokenCount", usage.optInt("input", 0)));
                usage.put("output", usageMetadata.optInt("candidatesTokenCount", usage.optInt("output", 0)));
            }
            JSONArray candidates = data.optJSONArray("candidates");
            if (candidates == null || candidates.length() == 0) {
                return "";
            }
            JSONObject firstCandidate = candidates.optJSONObject(0);
            if (firstCandidate == null) {
                return "";
            }
            JSONObject content = firstCandidate.optJSONObject("content");
            if (content == null) {
                return "";
            }
            JSONArray parts = content.optJSONArray("parts");
            if (parts == null) {
                return "";
            }
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < parts.length(); i++) {
                JSONObject part = parts.optJSONObject(i);
                if (part != null) {
                    builder.append(part.optString("text", ""));
                }
            }
            return builder.toString();
        }

        JSONObject usageData = data.optJSONObject("usage");
        if (usageData != null) {
            usage.put("input", usageData.optInt("prompt_tokens", usage.optInt("input", 0)));
            usage.put("output", usageData.optInt("completion_tokens", usage.optInt("output", 0)));
        }
        JSONArray choices = data.optJSONArray("choices");
        if (choices == null || choices.length() == 0) {
            return "";
        }
        JSONObject choice = choices.optJSONObject(0);
        if (choice == null) {
            return "";
        }
        JSONObject delta = choice.optJSONObject("delta");
        if (delta == null) {
            return "";
        }
        return delta.optString("content", "");
    }

    private String readFully(InputStream inputStream) throws IOException {
        if (inputStream == null) {
            return "";
        }
        try (InputStream stream = inputStream; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int read;
            while ((read = stream.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            return output.toString(StandardCharsets.UTF_8);
        }
    }

    private String extractErrorMessage(String body, int statusCode) {
        if (body == null || body.isBlank()) {
            return "HTTP " + statusCode;
        }
        try {
            JSONObject json = new JSONObject(body);
            if (json.has("error")) {
                Object error = json.get("error");
                if (error instanceof JSONObject) {
                    return ((JSONObject) error).optString("message", "HTTP " + statusCode);
                }
                return String.valueOf(error);
            }
        } catch (JSONException ignored) {
        }
        return body.length() > 240 ? body.substring(0, 240) : body;
    }

    private String extractErrorFromEvent(JSONObject event) {
        Object error = event.opt("error");
        if (error instanceof JSONObject) {
            return ((JSONObject) error).optString("message", String.valueOf(error));
        }
        return String.valueOf(error);
    }

    private JSONObject buildBaseState(String sessionId, String conversationId, String conversationTitle, String aiMsgId) {
        JSONObject state = new JSONObject();
        try {
            state.put("sessionId", sessionId);
            state.put("conversationId", conversationId);
            state.put("conversationTitle", conversationTitle);
            state.put("aiMsgId", aiMsgId);
            state.put("status", "starting");
            state.put("fullText", "");
            state.put("error", "");
            state.put("httpStatus", 0);
            state.put("updatedAt", System.currentTimeMillis());
            state.put("usage", new JSONObject().put("input", 0).put("output", 0));
        } catch (JSONException ignored) {
        }
        return state;
    }

    private void putStatus(JSONObject state, String status) {
        try {
            state.put("status", status);
        } catch (JSONException ignored) {
        }
    }

    private void putFullText(JSONObject state, String fullText) {
        try {
            state.put("fullText", fullText == null ? "" : fullText);
        } catch (JSONException ignored) {
        }
    }

    private void putError(JSONObject state, String error) {
        try {
            state.put("error", error == null ? "" : error);
        } catch (JSONException ignored) {
        }
    }

    private void putHttpStatus(JSONObject state, int httpStatus) {
        try {
            state.put("httpStatus", httpStatus);
        } catch (JSONException ignored) {
        }
    }

    private void putUsage(JSONObject state, JSONObject usage) {
        try {
            state.put("usage", usage == null ? new JSONObject() : usage);
        } catch (JSONException ignored) {
        }
    }

    private void putUpdatedAt(JSONObject state) {
        try {
            state.put("updatedAt", System.currentTimeMillis());
        } catch (JSONException ignored) {
        }
    }

    private void acquireWakeLock() {
        releaseWakeLock();
        PowerManager powerManager = getSystemService(PowerManager.class);
        if (powerManager == null) {
            return;
        }
        PowerManager.WakeLock newWakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                getPackageName() + ":NativeAiStream"
        );
        newWakeLock.setReferenceCounted(false);
        newWakeLock.acquire(WAKE_LOCK_TIMEOUT_MS);
        wakeLock = newWakeLock;
    }

    private void releaseWakeLock() {
        PowerManager.WakeLock currentWakeLock = wakeLock;
        wakeLock = null;
        if (currentWakeLock != null && currentWakeLock.isHeld()) {
            currentWakeLock.release();
        }
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager == null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_ai_name),
                NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription(getString(R.string.notification_channel_ai_description));
        notificationManager.createNotificationChannel(channel);
    }

    private NotificationCompat.Builder createBaseNotification(String sessionId, String conversationTitle) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.putExtra(
                MainActivity.EXTRA_START_PATH,
                "chat.html?id=" + UriCompat.encode(activeSessionConversationId(sessionId))
        );
        openIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        Intent cancelIntent = new Intent(this, NativeAiStreamService.class);
        cancelIntent.setAction(ACTION_CANCEL);
        cancelIntent.putExtra(EXTRA_SESSION_ID, sessionId);

        PendingIntent openPendingIntent = PendingIntent.getActivity(
                this,
                sessionId.hashCode(),
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent cancelPendingIntent = PendingIntent.getService(
                this,
                sessionId.hashCode(),
                cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_notify_chat)
                .setContentTitle(
                        conversationTitle == null || conversationTitle.isBlank()
                                ? getString(R.string.app_name)
                                : conversationTitle
                )
                .setContentIntent(openPendingIntent)
                .setOnlyAlertOnce(true)
                .addAction(0, getString(R.string.notification_ai_stop_action), cancelPendingIntent);
    }

    private android.app.Notification buildOngoingNotification(
            String sessionId,
            String conversationTitle,
            String contentText,
            String previewText,
            boolean indeterminate
    ) {
        NotificationCompat.Builder builder = createBaseNotification(sessionId, conversationTitle)
                .setContentText(contentText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(contentText))
                .setOngoing(true)
                .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setProgress(0, 0, indeterminate);
        return builder.build();
    }

    private void updateOngoingNotification(String sessionId, String conversationTitle, String fullText, long startedAt) {
        long now = System.currentTimeMillis();
        if (now - lastNotificationUpdateAt < 800) {
            return;
        }
        lastNotificationUpdateAt = now;
        String elapsed = ((now - startedAt) / 1000) + "s";
        String preview = normalizePreviewText(fullText);
        NotificationManagerCompat.from(this).notify(
                NOTIFICATION_ID,
                buildOngoingNotification(
                        sessionId,
                        conversationTitle,
                        getString(R.string.notification_ai_background_generating),
                        preview,
                        false
                )
        );
    }

    private void showTerminalNotification(String sessionId, String conversationTitle, String fullText, String contentText) {
        NotificationCompat.Builder builder = createBaseNotification(sessionId, conversationTitle)
                .setContentText(contentText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(contentText))
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, builder.build());
    }

    private String normalizePreviewText(String text) {
        if (text == null || text.isBlank()) {
            return getString(R.string.notification_ai_reply_fallback);
        }
        String cleaned = text.replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (cleaned.isBlank()) {
            return getString(R.string.notification_ai_reply_fallback);
        }
        return cleaned.length() > 120 ? cleaned.substring(0, 117) + "..." : cleaned;
    }

    private String activeSessionConversationId(String sessionId) {
        String json = NativeAiStreamStore.readState(this, sessionId);
        if (json == null || json.isBlank()) {
            return "";
        }
        try {
            return new JSONObject(json).optString("conversationId", "");
        } catch (JSONException e) {
            return "";
        }
    }

    private void closeActiveConnection() {
        BufferedReader reader = activeReader;
        activeReader = null;
        if (reader != null) {
            try {
                reader.close();
            } catch (IOException ignored) {
            }
        }

        HttpURLConnection connection = activeConnection;
        activeConnection = null;
        if (connection != null) {
            connection.disconnect();
        }
    }

    private static final class HttpStatusException extends IOException {
        private final int statusCode;

        private HttpStatusException(int statusCode, String message) {
            super(message);
            this.statusCode = statusCode;
        }
    }

    private static final class UriCompat {
        private UriCompat() {
        }

        static String encode(String value) {
            if (value == null) {
                return "";
            }
            return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
        }
    }
}
