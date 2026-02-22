import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";

// ─── Helper: fetch profile row ─────────────────────────────────────────────────
const fetchProfile = async (userId) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) return null;
    return data;
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return rejectWithValue(error.message);

            const profile = await fetchProfile(data.user.id);
            const user = {
                id: data.user.id,
                name: profile?.name || data.user.user_metadata?.name || email.split("@")[0],
                email: data.user.email,
                avatar_url: profile?.avatar_url || null,
            };

            localStorage.setItem("auth_user", JSON.stringify(user));
            return user;
        } catch (err) {
            return rejectWithValue(err?.message || "Network error — please check your connection.");
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });
            if (error) return rejectWithValue(error.message);

            if (!data.session) {
                return rejectWithValue(
                    "A confirmation email has been sent. Please verify your email before logging in."
                );
            }

            // Trigger may not have fired yet — upsert profile manually to be safe
            // Non-fatal: if RLS blocks this, the trigger already created the row
            const { error: upsertErr } = await supabase.from("profiles").upsert({
                id: data.user.id,
                name,
                email: data.user.email,
            });
            if (upsertErr) {
                console.warn("[registerUser] Profile upsert skipped (trigger handled it):", upsertErr.message);
            }

            const user = {
                id: data.user.id,
                name,
                email: data.user.email,
                avatar_url: null,
            };

            localStorage.setItem("auth_user", JSON.stringify(user));
            return user;
        } catch (err) {
            return rejectWithValue(err?.message || "Network error — please check your connection.");
        }
    }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("auth_user");
});

export const loadAuth = createAsyncThunk("auth/loadAuth", async () => {
    try {
        const stored = localStorage.getItem("auth_user");
        if (stored) {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                return JSON.parse(stored);
            }
            localStorage.removeItem("auth_user");
        }
    } catch {
        // Network error during session restore — silently ignore, user just isn't authenticated
        localStorage.removeItem("auth_user");
    }
    return null;
});

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async ({ userId, name }, { rejectWithValue }) => {
        const { error } = await supabase
            .from("profiles")
            .update({ name })
            .eq("id", userId);
        if (error) return rejectWithValue(error.message);

        const stored = localStorage.getItem("auth_user");
        if (stored) {
            const user = JSON.parse(stored);
            user.name = name;
            localStorage.setItem("auth_user", JSON.stringify(user));
        }
        return { name };
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: "auth",
    initialState: {
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        authLoading: true,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // loadAuth
        builder
            .addCase(loadAuth.pending, (state) => { state.authLoading = true; })
            .addCase(loadAuth.fulfilled, (state, action) => {
                state.authLoading = false;
                state.currentUser = action.payload;
                state.isAuthenticated = !!action.payload;
            })
            .addCase(loadAuth.rejected, (state) => {
                state.authLoading = false;
                state.isAuthenticated = false;
            });

        // loginUser
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // registerUser
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // logoutUser
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
        });

        // updateProfile
        builder
            .addCase(updateProfile.pending, (state) => { state.loading = true; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentUser) {
                    state.currentUser.name = action.payload.name;
                }
            })
            .addCase(updateProfile.rejected, (state) => { state.loading = false; });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
