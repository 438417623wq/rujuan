package com.rujuan.airp;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public final class NativeAiStreamStore {
    private static final String PREFS_NAME = "airp_native_ai_stream";
    private static final String KEY_ACTIVE_SESSION_ID = "active_session_id";
    private static final String KEY_LAST_SESSION_ID = "last_session_id";

    private NativeAiStreamStore() {
    }

    public static synchronized void writeState(Context context, JSONObject state) {
        String sessionId = state.optString("sessionId", "");
        if (sessionId.isBlank()) {
            return;
        }

        File dir = getStoreDir(context);
        File file = new File(dir, sessionId + ".json");
        try {
            java.nio.file.Files.write(file.toPath(), state.toString().getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) {
        }

        SharedPreferences prefs = prefs(context);
        SharedPreferences.Editor editor = prefs.edit().putString(KEY_LAST_SESSION_ID, sessionId);
        if (isTerminalStatus(state.optString("status"))) {
            if (sessionId.equals(prefs.getString(KEY_ACTIVE_SESSION_ID, null))) {
                editor.remove(KEY_ACTIVE_SESSION_ID);
            }
        } else {
            editor.putString(KEY_ACTIVE_SESSION_ID, sessionId);
        }
        editor.apply();
    }

    public static synchronized String readState(Context context, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }

        File file = new File(getStoreDir(context), sessionId + ".json");
        if (!file.exists()) {
            return null;
        }
        try {
            return new String(java.nio.file.Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return null;
        }
    }

    public static synchronized String readActiveState(Context context) {
        return readState(context, prefs(context).getString(KEY_ACTIVE_SESSION_ID, null));
    }

    public static synchronized String readLatestState(Context context) {
        return readState(context, prefs(context).getString(KEY_LAST_SESSION_ID, null));
    }

    public static synchronized void clearState(Context context, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        File file = new File(getStoreDir(context), sessionId + ".json");
        if (file.exists()) {
            file.delete();
        }

        SharedPreferences prefs = prefs(context);
        SharedPreferences.Editor editor = prefs.edit();
        if (sessionId.equals(prefs.getString(KEY_ACTIVE_SESSION_ID, null))) {
            editor.remove(KEY_ACTIVE_SESSION_ID);
        }
        if (sessionId.equals(prefs.getString(KEY_LAST_SESSION_ID, null))) {
            editor.remove(KEY_LAST_SESSION_ID);
        }
        editor.apply();
    }

    public static synchronized boolean isTerminalStatus(String status) {
        return "completed".equals(status)
                || "error".equals(status)
                || "cancelled".equals(status);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private static File getStoreDir(Context context) {
        File dir = new File(context.getFilesDir(), "airp-native-streams");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }
}
