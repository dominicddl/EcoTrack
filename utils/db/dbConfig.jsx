
import {neon} from '@neondatabase/serverless'

import {drizzle} from 'drizzle-orm/neon-http'

import * as schema from './schema'

const sql = neon("postgresql://ecotrackdb_owner:npg_Rm2pZTdxIf7A@ep-damp-art-a80qq51y.eastus2.azure.neon.tech/ecotrackdb?sslmode=require");

export const db = drizzle(sql, {schema})