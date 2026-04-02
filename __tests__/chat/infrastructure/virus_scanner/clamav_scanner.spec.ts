import { ClamAVScanner } from "../../../../src/modules/chat/infrasctructure/virus_scanner/clamav_scanner";
import NodeClam from "clamscan";

jest.mock("clamscan");

describe("ClamAVScanner", () => {
    let scanner: ClamAVScanner;
    let mockClamscan: any;

    beforeEach(() => {
        mockClamscan = {
            scanStream: jest.fn()
        };
        (NodeClam as unknown as jest.Mock).mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(mockClamscan)
        }));
        scanner = new ClamAVScanner();
        jest.clearAllMocks();
    });

    it("should return true if clamscan succeeds", async () => {
        mockClamscan.scanStream.mockResolvedValue({ isInfected: false, viruses: [] });

        const result = await scanner.scanBuffer(Buffer.from("clean file"));

        expect(result).toBe(true);
        expect(mockClamscan.scanStream).toHaveBeenCalled();
    });

    it("should return false if clamscan finds a virus", async () => {
        mockClamscan.scanStream.mockResolvedValue({ isInfected: true, viruses: ["Eicar-Test-Signature"] });

        const result = await scanner.scanBuffer(Buffer.from("infected file"));

        expect(result).toBe(false);
    });

    it("should return false if clamscan throws an error", async () => {
        mockClamscan.scanStream.mockRejectedValue(new Error("Daemon unreachable"));

        const result = await scanner.scanBuffer(Buffer.from("some file"));

        expect(result).toBe(false);
    });
});
