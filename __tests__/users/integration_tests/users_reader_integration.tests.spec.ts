import { Pool, PoolClient } from "pg";
import { UserRepoReaderPg } from "../../../src/modules/users/repositories/user_repo_reader_pg";
import { User } from "../../../src/modules/users/domain/user";
import { Username } from "../../../src/modules/users/domain/Username";


describe("UserRepoReaderPg (integration - transactional)", () => {
    let pool: Pool;
    let client: PoolClient;
    let repo: UserRepoReaderPg;

    beforeAll(async () => {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    });

    beforeEach(async () => {
        client = await pool.connect();
        await client.query("BEGIN");
        repo = new UserRepoReaderPg(client);
    });

    afterEach(async () => {
        await client.query("ROLLBACK");
        client.release();
    });

    afterAll(async () => {
        await pool.end();
    });

    async function insertTestUser() {
        await client.query(
            `
            INSERT INTO users (
                id,
                username,
                email,
                password_hash,
                is_active,
                is_verified,
                last_seen_at,
                created_at,
                updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            `,
            [
                "11111111-1111-1111-1111-111111111111",
                "readeruser",
                "reader@example.com",
                "hash123",
                true,
                true,
                null,
                new Date(),
                new Date(),
            ]
        );
    }

    it("should return user by id", async () => {
        await insertTestUser();

        const user = await repo.getUserById(
            "11111111-1111-1111-1111-111111111111"
        );

        expect(user).not.toBeNull();
        expect(user?.id).toBe("11111111-1111-1111-1111-111111111111");
    });

    it("should return user by username", async () => {
        await insertTestUser();

        const user = await repo.getUserByUsername("readeruser");

        expect(user).not.toBeNull();
        expect(user?.getUsername().getValue()).toBe("readeruser");
    });

    it("should return null if user not found by id", async () => {
        const user = await repo.getUserById(
            "22222222-2222-2222-2222-222222222222"
        );

        expect(user).toBeNull();
    });

    it("should return null if user not found by username", async () => {
        const user = await repo.getUserByUsername("nonexistentuser");
        expect(user).toBeNull();
    })

    it("should find user by email", async () => {
        await insertTestUser();

        const user = await repo.getUserByEmail("reader@example.com");
        expect(user).toBeDefined();
        expect(user!.id).toBe("11111111-1111-1111-1111-111111111111");
        expect(user!.getUsername().getValue()).toBe("readeruser");
        expect(user!.getEmail().getValue()).toBe("reader@example.com");
    })

    it("should return null if user not found by email", async () => {
        const user = await repo.getUserByEmail("nonexistent@gmail.com");
        expect(user).toBeNull();
    })
});