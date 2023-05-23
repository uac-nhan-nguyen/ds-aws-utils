"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialsFromProfile = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const getCredentialsFromProfile = (profile) => {
    if (profile == null)
        return undefined;
    const file = Buffer.from(fs_1.default.readFileSync(`${os_1.default.homedir()}/.aws/credentials`)).toString('utf-8');
    const lines = file.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`[${profile}]`)) {
            let accessKeyId, secretAccessKey;
            for (let j = 1; j < 4; j++) {
                const [k, v] = lines[i + j].split('=');
                if (k === 'aws_access_key_id') {
                    accessKeyId = v.trim();
                }
                else if (k === 'aws_secret_access_key') {
                    secretAccessKey = v.trim();
                }
            }
            return new aws_sdk_1.default.Credentials({
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            });
        }
    }
    throw `Profile ${profile} not found`;
};
exports.getCredentialsFromProfile = getCredentialsFromProfile;
//# sourceMappingURL=profile.js.map