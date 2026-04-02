import { ClamAVScanner } from "../../../../src/modules/chat/infrasctructure/virus_scanner/clamav_scanner";
import { exec } from "child_process";
import fs from "fs/promises";

jest.mock("child_process", () => ({
    exec: jest.fn()
}));

jest.mock("fs/promises", () => ({
    writeFile: jest.fn(),
    unlink: jest.fn()
}));

describe("ClamAVScanner", () => {
    let scanner: ClamAVScanner;

    beforeEach(() => {
        scanner = new ClamAVScanner();
        jest.clearAllMocks();
    });

    it("should return true if clamscan succeeds", async () => {
        (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
            callback(null, { stdout: "clean", stderr: "" });
        });
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
        (fs.unlink as jest.Mock).mockResolvedValue(undefined);

        const result = await scanner.scanBuffer(Buffer.from("clean file"));

        expect(result).toBe(true);
        expect(exec).toHaveBeenCalledWith(expect.stringContaining("clamscan /tmp/scan_"), expect.any(Function));
        expect(fs.writeFile).toHaveBeenCalled();
        expect(fs.unlink).toHaveBeenCalled();
    });

    it("should return false if clamscan fails", async () => {
        (exec as unknown as jest.Mock).mockImplementation((cmd, callback) => {
            callback(new Error("Virus found"), { stdout: "", stderr: "Infected" });
        });
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
        (fs.unlink as jest.Mock).mockResolvedValue(undefined);

        const result = await scanner.scanBuffer(Buffer.from("infected file"));

        expect(result).toBe(false);
        expect(fs.unlink).toHaveBeenCalled();
    });
});
