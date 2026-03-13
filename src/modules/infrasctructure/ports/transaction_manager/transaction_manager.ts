import {TransactionManagerInterface} from "./transaction_manager_interface";
import {Pool, PoolClient} from "pg";


export class TransactionManager implements TransactionManagerInterface {
    constructor(private readonly pool: Pool) {}

    async runInTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const result = await callback(client);

            await client.query('COMMIT');

            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}