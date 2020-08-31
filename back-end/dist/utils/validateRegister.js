"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (options.username.length < 2) {
        return [
            {
                field: "username",
                message: "Length must be greater than 2"
            },
        ];
    }
    if (options.username.length < 2) {
        return [
            {
                field: "username",
                message: "Length must be greater than 2"
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: "username",
                message: "Cannot include an @ sign"
            },
        ];
    }
    if (!options.email.includes('@')) {
        return [
            {
                field: "email",
                message: "invalid email"
            },
        ];
    }
    if (options.password.length < 5) {
        return [
            {
                field: "password",
                message: "Length must be greater than 5"
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map