"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_username_use_case_1 = require("../../../src/modules/users/application/login_username_use_case");
const use_case_errors_1 = require("../../../src/modules/users/errors/use_case_errors");
const user_1 = require("../../../src/modules/users/domain/user");
describe("LoginUsernameUseCase", () => {
    let reader;
    let bcrypt;
    let mapper;
    let useCase;
    let user;
    const validUsername = "testuser";
    const validPassword = "Str0ng_P@ss1!";
    const wrongPassword = "Wrong_P@ss9!";
    beforeEach(() => {
        reader = {
            getUserByUsername: jest.fn(),
        };
        bcrypt = {
            compare: jest.fn(),
        };
        mapper = {
            mapToDto: jest.fn(),
        };
        useCase = new login_username_use_case_1.LoginUsernameUseCase(reader, bcrypt, mapper);
        user = user_1.User.restore("11111111-1111-1111-1111-111111111111", validUsername, "test@example.com", "hashedPassword", true, true, new Date(), new Date(), new Date());
    });
    it("should login successfully", async () => {
        reader.getUserByUsername.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        mapper.mapToDto.mockReturnValue({ id: user.id });
        const result = await useCase.loginByUsernameUseCase(validUsername, validPassword);
        expect(reader.getUserByUsername).toHaveBeenCalledWith(validUsername);
        expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, "hashedPassword");
        expect(mapper.mapToDto).toHaveBeenCalledWith(user);
        expect(result).toEqual({ id: user.id });
    });
    it("should throw if user not found", async () => {
        reader.getUserByUsername.mockResolvedValue(null);
        await expect(useCase.loginByUsernameUseCase(validUsername, validPassword)).rejects.toBeInstanceOf(use_case_errors_1.UserNotFoundError);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("should throw if password does not match", async () => {
        reader.getUserByUsername.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);
        await expect(useCase.loginByUsernameUseCase(validUsername, wrongPassword)).rejects.toBeInstanceOf(use_case_errors_1.InvalidCredentialsError);
        expect(mapper.mapToDto).not.toHaveBeenCalled();
    });
    it("should throw if user is inactive", async () => {
        const inactiveUser = user_1.User.restore(user.id, validUsername, "test@example.com", "hashedPassword", false, true, new Date(), new Date(), new Date());
        reader.getUserByUsername.mockResolvedValue(inactiveUser);
        await expect(useCase.loginByUsernameUseCase(validUsername, validPassword)).rejects.toThrow();
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("should throw if user is not verified", async () => {
        const notVerifiedUser = user_1.User.restore(user.id, validUsername, "test@example.com", "hashedPassword", true, false, new Date(), new Date(), new Date());
        reader.getUserByUsername.mockResolvedValue(notVerifiedUser);
        await expect(useCase.loginByUsernameUseCase(validUsername, validPassword)).rejects.toThrow();
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("should throw if username is invalid", async () => {
        await expect(useCase.loginByUsernameUseCase("ab", validPassword)).rejects.toThrow();
        expect(reader.getUserByUsername).not.toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
    it("should throw if password is invalid", async () => {
        await expect(useCase.loginByUsernameUseCase(validUsername, "short")).rejects.toThrow();
        expect(reader.getUserByUsername).not.toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });
});
