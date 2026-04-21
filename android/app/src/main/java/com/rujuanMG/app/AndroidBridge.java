package com.rujuanMG.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONTokener;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class AndroidBridge {
    private static final String TAG = "AndroidBridge";

    public interface NotificationPermissionDelegate {
        void requestNotificationPermissionIfNeeded();
    }

    private static final String AI_NOTIFICATION_CHANNEL_ID = "airp_ai_reply";
    private static final int AI_NOTIFICATION_ID = 1001;

    private final Context context;
    private final NotificationPermissionDelegate notificationPermissionDelegate;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public AndroidBridge(Context context, NotificationPermissionDelegate notificationPermissionDelegate) {
        this.context = context.getApplicationContext();
        this.notificationPermissionDelegate = notificationPermissionDelegate;
        createNotificationChannel();
    }

    @JavascriptInterface
    public boolean saveData(String key, String value) {
        File target = getStorageFile(key);
        File parent = target.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            return false;
        }

        try (FileOutputStream stream = new FileOutputStream(target, false)) {
            stream.write(value.getBytes(StandardCharsets.UTF_8));
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    @JavascriptInterface
    public String loadData(String key) {
        File target = getStorageFile(key);
        if (!target.exists()) {
            return null;
        }

        try {
            return new String(java.nio.file.Files.readAllBytes(target.toPath()), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return null;
        }
    }

    @JavascriptInterface
    public boolean deleteData(String key) {
        File target = getStorageFile(key);
        return !target.exists() || target.delete();
    }

    @JavascriptInterface
    public void saveFile(String content, String filename, String mimeType) {
        boolean ok = saveToDownloads(content, filename, mimeType);
        showToast(ok ? "文件已保存到 Downloads/入卷魔改版" : "文件保存失败");
    }

    @JavascriptInterface
    public String fetchModels(String profileJson) {
        try {
            JSONObject profile = profileJson == null || profileJson.isBlank()
                    ? new JSONObject()
                    : new JSONObject(profileJson);
            return fetchModelsInternal(profile).toString();
        } catch (Exception e) {
            JSONObject result = new JSONObject();
            try {
                result.put("success", false);
                result.put("models", new JSONArray());
                result.put("error", e.getMessage() == null ? "Failed to fetch models" : e.getMessage());
                result.put("status", 0);
                result.put("source", "native");
            } catch (JSONException ignored) {
            }
            return result.toString();
        }
    }

    @JavascriptInterface
    public String startNativeAiStream(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return null;
        }

        String sessionId;
        try {
            JSONObject payload = new JSONObject(payloadJson);
            sessionId = payload.optString("sessionId", "");
            if (sessionId.isBlank()) {
                return null;
            }
        } catch (JSONException e) {
            return null;
        }

        requestNotificationPermissionIfNeeded();
        Intent intent = new Intent(context, NativeAiStreamService.class);
        intent.setAction(NativeAiStreamService.ACTION_START);
        intent.putExtra(NativeAiStreamService.EXTRA_PAYLOAD_JSON, payloadJson);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (RuntimeException e) {
            Log.w(TAG, "Unable to start native AI stream service", e);
            return null;
        }
        return sessionId;
    }

    @JavascriptInterface
    public String getNativeAiStreamState(String sessionId) {
        return NativeAiStreamStore.readState(context, sessionId);
    }

    @JavascriptInterface
    public String getActiveNativeAiStream() {
        return NativeAiStreamStore.readActiveState(context);
    }

    @JavascriptInterface
    public String getLatestNativeAiStream() {
        return NativeAiStreamStore.readLatestState(context);
    }

    @JavascriptInterface
    public void clearNativeAiStreamState(String sessionId) {
        NativeAiStreamStore.clearState(context, sessionId);
    }

    @JavascriptInterface
    public void cancelNativeAiStream(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        NativeAiStreamService.requestCancel(context, sessionId);
    }

    @JavascriptInterface
    public void notifyAiStreaming(String targetPath, String conversationTitle) {
        mainHandler.post(() -> {
            requestNotificationPermissionIfNeeded();
            if (!canPostNotifications()) {
                return;
            }

            String text = context.getString(R.string.notification_ai_background_generating);
            NotificationCompat.Builder builder = createNotificationBuilder(targetPath, conversationTitle)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setProgress(0, 0, true)
                    .setCategory(NotificationCompat.CATEGORY_PROGRESS)
                    .setPriority(NotificationCompat.PRIORITY_LOW);

            notifySafely(AI_NOTIFICATION_ID, builder);
        });
    }

    @JavascriptInterface
    public void notifyAiReply(String targetPath, String conversationTitle, String previewText) {
        mainHandler.post(() -> {
            requestNotificationPermissionIfNeeded();
            if (!canPostNotifications()) {
                return;
            }

            String text = context.getString(R.string.notification_ai_background_done);
            NotificationCompat.Builder builder = createNotificationBuilder(targetPath, conversationTitle)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)
                    .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT);

            notifySafely(AI_NOTIFICATION_ID, builder);
        });
    }

    @JavascriptInterface
    public void notifyAiError(String targetPath, String conversationTitle) {
        mainHandler.post(() -> {
            requestNotificationPermissionIfNeeded();
            if (!canPostNotifications()) {
                return;
            }

            String text = context.getString(R.string.notification_ai_background_error);
            NotificationCompat.Builder builder = createNotificationBuilder(targetPath, conversationTitle)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)
                    .setCategory(NotificationCompat.CATEGORY_ERROR)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT);

            notifySafely(AI_NOTIFICATION_ID, builder);
        });
    }

    @JavascriptInterface
    public void cancelAiNotification() {
        mainHandler.post(() -> {
            try {
                NotificationManagerCompat.from(context).cancel(AI_NOTIFICATION_ID);
            } catch (RuntimeException e) {
                Log.w(TAG, "Unable to cancel AI notification", e);
            }
        });
    }

    private JSONObject fetchModelsInternal(JSONObject profile) throws JSONException {
        String provider = detectProvider(profile);
        List<String> urls = buildModelUrls(profile);
        JSONArray diagnostics = new JSONArray();

        for (String url : urls) {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(url).openConnection();
                connection.setRequestMethod("GET");
                connection.setDoInput(true);
                connection.setUseCaches(false);
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(30000);
                applyRequestHeaders(connection, buildRequestHeaders(profile, provider, "application/json", false));

                int status = connection.getResponseCode();
                String body = readAll(status >= 200 && status < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream());

                if (status < 200 || status >= 300) {
                    diagnostics.put(new JSONObject()
                            .put("url", url)
                            .put("status", status)
                            .put("error", extractApiErrorMessage(body, status)));
                    continue;
                }

                Object payload = (body == null || body.isBlank())
                        ? new JSONObject()
                        : new JSONTokener(body).nextValue();
                JSONArray models = extractModelIds(payload, provider);
                if (models.length() > 0) {
                    return new JSONObject()
                            .put("success", true)
                            .put("models", models)
                            .put("status", status)
                            .put("endpoint", url)
                            .put("source", "native");
                }

                diagnostics.put(new JSONObject()
                        .put("url", url)
                        .put("status", status)
                        .put("error", "接口已返回成功，但未解析到可用模型列表"));
            } catch (Exception e) {
                diagnostics.put(new JSONObject()
                        .put("url", url)
                        .put("status", 0)
                        .put("error", e.getMessage() == null ? "NetworkError" : e.getMessage()));
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }
        }

        JSONObject best = chooseBestDiagnostic(diagnostics);
        return new JSONObject()
                .put("success", false)
                .put("models", new JSONArray())
                .put("error", best.optString("error", "未能获取模型列表"))
                .put("status", best.optInt("status", 0))
                .put("endpoint", best.optString("url", ""))
                .put("diagnostics", diagnostics)
                .put("source", "native");
    }

    private JSONObject chooseBestDiagnostic(JSONArray diagnostics) {
        JSONObject fallback = new JSONObject();
        try {
            fallback.put("error", "未能获取模型列表");
            fallback.put("status", 0);
            fallback.put("url", "");
        } catch (JSONException ignored) {
        }

        JSONObject first = diagnostics.optJSONObject(0);
        if (first == null) {
            return fallback;
        }

        for (int i = 0; i < diagnostics.length(); i++) {
            JSONObject item = diagnostics.optJSONObject(i);
            if (item == null) continue;
            int status = item.optInt("status", 0);
            if (status == 401 || status == 403) return item;
        }
        for (int i = 0; i < diagnostics.length(); i++) {
            JSONObject item = diagnostics.optJSONObject(i);
            if (item == null) continue;
            if (item.optInt("status", 0) >= 400) return item;
        }
        return first;
    }

    private List<String> buildModelUrls(JSONObject profile) {
        List<String> urls = new ArrayList<>();
        String profileProvider = profile.optString("provider", "openai");
        String normalizedBase = normalizeBaseUrl(profile);

        if ("google-ai-studio".equals(profileProvider)) {
            urls.add(normalizedBase + "/models?key=" + profile.optString("apiKey", ""));
            return urls;
        }

        String rawBase = rawBaseUrl(profile);
        addUniqueUrl(urls, normalizedBase + "/models");
        if (normalizedBase.toLowerCase(Locale.US).contains("nano-gpt")) {
            addUniqueUrl(urls, normalizedBase + "/models?detailed=true");
        }
        if (!rawBase.equals(normalizedBase)) {
            addUniqueUrl(urls, rawBase + "/models");
            if (rawBase.toLowerCase(Locale.US).contains("nano-gpt")) {
                addUniqueUrl(urls, rawBase + "/models?detailed=true");
            }
        }
        return urls;
    }

    private void addUniqueUrl(List<String> urls, String url) {
        if (url == null || url.isBlank() || urls.contains(url)) {
            return;
        }
        urls.add(url);
    }

    private JSONArray extractModelIds(Object payload, String provider) throws JSONException {
        JSONArray models = new JSONArray();
        HashSet<String> seen = new HashSet<>();

        if ("google".equals(provider) && payload instanceof JSONObject payloadObject) {
            JSONArray remoteModels = payloadObject.optJSONArray("models");
            if (remoteModels != null) {
                for (int i = 0; i < remoteModels.length(); i++) {
                    JSONObject item = remoteModels.optJSONObject(i);
                    if (item == null) continue;
                    String name = item.optString("name", "");
                    if (name.contains("gemini")) {
                        addModelId(models, seen, name.replaceFirst("^models/", ""));
                    }
                }
            }
            return models;
        }

        if (payload instanceof JSONArray payloadArray) {
            collectModelIdsFromArray(payloadArray, models, seen);
        } else if (payload instanceof JSONObject payloadObject) {
            collectModelIdsFromArray(payloadObject.optJSONArray("data"), models, seen);
            collectModelIdsFromArray(payloadObject.optJSONArray("models"), models, seen);
            collectModelIdsFromArray(payloadObject.optJSONArray("items"), models, seen);
            collectModelIdsFromArray(payloadObject.optJSONArray("results"), models, seen);
            collectModelIdsFromArray(payloadObject.optJSONArray("model_list"), models, seen);

            JSONObject nestedData = payloadObject.optJSONObject("data");
            if (nestedData != null) {
                collectModelIdsFromArray(nestedData.optJSONArray("models"), models, seen);
                collectModelIdsFromArray(nestedData.optJSONArray("items"), models, seen);
            }

            JSONObject nestedResult = payloadObject.optJSONObject("result");
            if (nestedResult != null) {
                collectModelIdsFromArray(nestedResult.optJSONArray("models"), models, seen);
                collectModelIdsFromArray(nestedResult.optJSONArray("items"), models, seen);
            }
        }

        return models;
    }

    private void collectModelIdsFromArray(JSONArray entries, JSONArray models, HashSet<String> seen)
            throws JSONException {
        if (entries == null) {
            return;
        }
        for (int i = 0; i < entries.length(); i++) {
            Object item = entries.opt(i);
            if (item instanceof String value) {
                addModelId(models, seen, value);
            } else if (item instanceof JSONObject object) {
                String value = firstNonBlank(
                        object.optString("id", ""),
                        object.optString("name", ""),
                        object.optString("model", ""),
                        object.optString("slug", ""),
                        object.optString("value", "")
                );
                addModelId(models, seen, value);
            }
        }
    }

    private void addModelId(JSONArray models, HashSet<String> seen, String value) throws JSONException {
        String clean = value == null ? "" : value.trim();
        if (clean.isEmpty() || seen.contains(clean)) {
            return;
        }
        seen.add(clean);
        models.put(clean);
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

    private void applyRequestHeaders(HttpURLConnection connection, Map<String, String> headers) {
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            String key = entry.getKey().trim();
            String value = entry.getValue().trim();
            if (key.isEmpty() || value.isEmpty()) continue;
            connection.setRequestProperty(key, value);
        }
    }

    private Map<String, String> parseExtraHeaders(String raw) {
        LinkedHashMap<String, String> headers = new LinkedHashMap<>();
        String text = raw == null ? "" : raw.trim();
        if (text.isEmpty()) {
            return headers;
        }

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
            if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("//")) {
                continue;
            }
            int separator = trimmed.indexOf(':');
            if (separator <= 0) {
                continue;
            }
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

    private String detectProvider(JSONObject profile) {
        String provider = profile.optString("provider", "openai");
        if ("claude".equals(provider)) return "claude";
        if ("google-ai-studio".equals(provider)) return "google";
        String url = normalizeBaseUrl(profile).toLowerCase(Locale.US);
        if (url.contains("anthropic")) return "claude";
        if (url.contains("generativelanguage.googleapis")) return "google";
        return "openai";
    }

    private String defaultBaseUrl(String provider) {
        if ("claude".equals(provider)) return "https://api.anthropic.com/v1";
        if ("google-ai-studio".equals(provider)) return "https://generativelanguage.googleapis.com/v1beta";
        return "https://api.openai.com/v1";
    }

    private String rawBaseUrl(JSONObject profile) {
        String raw = sanitizeBaseUrl(profile.optString("baseUrl", ""));
        if (raw.isEmpty()) {
            return defaultBaseUrl(profile.optString("provider", "openai"));
        }
        return raw;
    }

    private String normalizeBaseUrl(JSONObject profile) {
        String provider = profile.optString("provider", "openai");
        String rawBase = sanitizeBaseUrl(profile.optString("baseUrl", ""));
        if (rawBase.isEmpty()) {
            return defaultBaseUrl(provider);
        }

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
        if (url.getPort() != -1) {
            builder.append(':').append(url.getPort());
        }
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

    private String readAll(InputStream inputStream) throws IOException {
        if (inputStream == null) {
            return "";
        }
        try (InputStream in = inputStream; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int count;
            while ((count = in.read(buffer)) != -1) {
                output.write(buffer, 0, count);
            }
            return output.toString(StandardCharsets.UTF_8);
        }
    }

    private String extractApiErrorMessage(String body, int statusCode) {
        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) return "HTTP " + statusCode;
        try {
            Object payload = new JSONTokener(text).nextValue();
            if (payload instanceof JSONObject object) {
                JSONObject error = object.optJSONObject("error");
                if (error != null && !error.optString("message", "").isBlank()) {
                    return error.optString("message");
                }
                String message = firstNonBlank(
                        object.optString("error", ""),
                        object.optString("message", ""),
                        object.optString("detail", ""),
                        object.optString("details", "")
                );
                if (!message.isBlank()) return message;
            }
        } catch (JSONException ignored) {
        }
        String compact = text.replaceAll("\\s+", " ").trim();
        return compact.length() > 200 ? compact.substring(0, 197) + "..." : compact;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private boolean saveToDownloads(String content, String filename, String mimeType) {
        ContentResolver resolver = context.getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, sanitizeFilename(filename));
        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType == null || mimeType.isBlank() ? "application/octet-stream" : mimeType);
        values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/入卷魔改版");

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            return false;
        }

        try (OutputStream outputStream = resolver.openOutputStream(uri)) {
            if (outputStream == null) {
                return false;
            }
            outputStream.write(content.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
            return true;
        } catch (IOException e) {
            resolver.delete(uri, null, null);
            return false;
        }
    }

    private NotificationCompat.Builder createNotificationBuilder(String targetPath, String conversationTitle) {
        return new NotificationCompat.Builder(context, AI_NOTIFICATION_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_small)
                .setContentTitle(normalizeConversationTitle(conversationTitle))
                .setContentIntent(buildLaunchPendingIntent(targetPath));
    }

    private PendingIntent buildLaunchPendingIntent(String targetPath) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra(MainActivity.EXTRA_START_PATH, sanitizeTargetPath(targetPath));
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        try {
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            if (notificationManager == null) {
                return;
            }
            NotificationChannel channel = new NotificationChannel(
                    AI_NOTIFICATION_CHANNEL_ID,
                    context.getString(R.string.notification_channel_ai_name),
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription(context.getString(R.string.notification_channel_ai_description));
            channel.setShowBadge(false);
            notificationManager.createNotificationChannel(channel);
        } catch (RuntimeException e) {
            Log.w(TAG, "Unable to create notification channel", e);
        }
    }

    private boolean canPostNotifications() {
        boolean permissionGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
        if (!permissionGranted) {
            return false;
        }
        try {
            return NotificationManagerCompat.from(context).areNotificationsEnabled();
        } catch (RuntimeException e) {
            Log.w(TAG, "Unable to query notification availability", e);
            return false;
        }
    }

    private void requestNotificationPermissionIfNeeded() {
        if (notificationPermissionDelegate != null) {
            notificationPermissionDelegate.requestNotificationPermissionIfNeeded();
        }
    }

    private File getStorageFile(String key) {
        String hashed = sha256(key);
        File dir = new File(context.getFilesDir(), "airp-data");
        return new File(dir, hashed + ".json");
    }

    private String sanitizeFilename(String filename) {
        String fallback = "airp-export.json";
        if (filename == null || filename.isBlank()) {
            return fallback;
        }
        return filename.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String sanitizeTargetPath(String targetPath) {
        if (targetPath == null || targetPath.isBlank()) {
            return "index.html";
        }
        String sanitized = targetPath.trim();
        if (sanitized.startsWith("http://") || sanitized.startsWith("https://")) {
            return "index.html";
        }
        while (sanitized.startsWith("/")) {
            sanitized = sanitized.substring(1);
        }
        return sanitized.isBlank() ? "index.html" : sanitized;
    }

    private String normalizeConversationTitle(String conversationTitle) {
        if (conversationTitle == null || conversationTitle.isBlank()) {
            return context.getString(R.string.app_name);
        }
        return conversationTitle.trim();
    }

    private void notifySafely(int notificationId, NotificationCompat.Builder builder) {
        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build());
        } catch (RuntimeException e) {
            Log.w(TAG, "Unable to post AI notification", e);
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(value.hashCode());
        }
    }

    private void showToast(String message) {
        mainHandler.post(() -> Toast.makeText(context, message, Toast.LENGTH_SHORT).show());
    }
}
