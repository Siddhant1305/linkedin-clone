import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../action/authAction";

const initialState = {
    user: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    profileFetched: false,
    connection: [],
    connectionRequest: []
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser: (state) => {
            state.message = "hello";
        }
    },

    extraReducers: (builder) => {

        builder

            // Login Reducer
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.message = "Knocking the Door...";
            })
            .addCase(loginUser.fulfilled, (state, action) => {

                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.loggedIn = true;
                state.message = "Login Successful";

            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Register Reducer
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.message = "Registering You";
            })
            .addCase(registerUser.fulfilled, (state) => {

                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.loggedIn = true;
                state.message = "Registration Successful";

            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export default authSlice.reducer;