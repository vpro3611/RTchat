"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avatar = void 0;
class Avatar {
    id;
    data;
    mimeType;
    createdAt;
    constructor(id, data, mimeType, createdAt) {
        this.id = id;
        this.data = data;
        this.mimeType = mimeType;
        this.createdAt = createdAt;
    }
    static create(data, mimeType) {
        return new Avatar(null, data, mimeType);
    }
    static restore(id, data, mimeType, createdAt) {
        return new Avatar(id, data, mimeType, createdAt);
    }
    getId = () => this.id;
    getData = () => this.data;
    getMimeType = () => this.mimeType;
    getCreatedAt = () => this.createdAt;
}
exports.Avatar = Avatar;
