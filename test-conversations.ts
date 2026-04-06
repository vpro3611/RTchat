import { Pool } from 'pg';
import { ConversationRepositoryPg } from './src/modules/chat/repositories_pg_realization/conversation_repository_pg';
import { CryptoEncryptionService } from './src/modules/infrasctructure/crypto_encryption_service';
import { MapToConversationDto } from './src/modules/chat/shared/map_to_conversation_dto';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const enc = new CryptoEncryptionService(process.env.MESSAGE_ENCRYPTION_KEY);
const repo = new ConversationRepositoryPg(pool, enc);
const mapper = new MapToConversationDto();

repo.getUserConversations('120c847a-8a0a-414e-819b-eca385823f3e', 5)
  .then(res => {
    console.log(res.items.map(c => mapper.mapToConversationDto(c)));
    pool.end();
  }).catch(err => {
    console.error(err);
    pool.end();
  });