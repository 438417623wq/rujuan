package com.rujuanMG.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public final class NativeAiStreamStore {
    private static final String TAG = "NativeAiStreamStore";
    private static final String PREFS_NAME = "airp_native_ai_stream";
    private static final String KEY_ACTIVE_SESSION_ID = "active_session_id";
    private static final String KEY_LAST_SESSION_ID = "last_session_id";
    /** 终态流状态文件保留时长：留一段时间供「恢复上次生成」用，之后清理。 */
    private static final long TERMINAL_RETENTION_MS = 3L * 24 * 60 * 60 * 1000;

    private NativeAiStreamStore() {
    }

    public static synchronized void writeState(Context context, JSONObject state) {
        String sessionId = state.optString("sessionId", "");
        if (sessionId.isBlank()) {
            return;
        }

        File dir = getStoreDir(context);
        File file = new File(dir, sessionId + ".json");
        // 原子写：StreamingService 与服务端读取线程可能同时碰这个文件，
        // 就地截断写入会让读取方拿到半截 JSON（表现为"生成结果丢失"）。
        File tmp = new File(dir, sessionId + ".json.tmp");
        boolean writeOk = false;
        try {
            try (java.io.FileOutputStream out = new java.io.FileOutputStream(tmp, false)) {
                out.write(state.toString().getBytes(StandardCharsets.UTF_8));
                out.flush();
                out.getFD().sync();
            }
            writeOk = tmp.renameTo(file);
        } catch (IOException e) {
            Log.w(TAG, "writeState failed for " + sessionId, e);
        }
        if (!writeOk) {
            // 状态没落盘就不要推进指针，否则恢复时指向一个不存在/过期的文件
            //noinspection ResultOfMethodCallIgnored
            tmp.delete();
            Log.w(TAG, "writeState: not persisting pointers, payload write failed for " + sessionId);
            return;
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
        // commit 而非 apply：指针必须在文件已经落盘后同步可见，
        // apply 的异步落盘在进程被杀时可能丢掉，导致恢复找不到这次生成。
        editor.commit();
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

    /**
     * 清理遗留的流状态文件。
     * 每次生成都会写一个 nstream-*.json，旧版只在 JS 回调成功时才删——
     * 中途关页面/WebView 重载就永远留下，等于每轮回复在磁盘上存了两份，
     * 长期使用会把存储撑满（而存储满正是保存失败、存档损坏的直接原因）。
     */
    public static synchronized void pruneStaleStates(Context context) {
        File dir = getStoreDir(context);
        File[] files = dir.listFiles();
        if (files == null) {
            return;
        }
        String active = prefs(context).getString(KEY_ACTIVE_SESSION_ID, null);
        String last = prefs(context).getString(KEY_LAST_SESSION_ID, null);
        long now = System.currentTimeMillis();
        for (File file : files) {
            String name = file.getName();
            if (name.endsWith(".tmp")) {
                // 上次写入中途留下的临时文件
                //noinspection ResultOfMethodCallIgnored
                file.delete();
                continue;
            }
            if (!name.endsWith(".json")) {
                continue;
            }
            String sessionId = name.substring(0, name.length() - ".json".length());
            if (sessionId.equals(active) || sessionId.equals(last)) {
                continue; // 可能还要恢复，留着
            }
            if (now - file.lastModified() > TERMINAL_RETENTION_MS) {
                //noinspection ResultOfMethodCallIgnored
                file.delete();
            }
        }
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
