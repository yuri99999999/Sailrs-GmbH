import PouchDB     from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

const dbBaseName = window.location.pathname.replace(/\//g, '_');

PouchDB.plugin(PouchDBFind);

let remoteDb: PouchDB.Database | null = null;
let rep: PouchDB.Replication.Sync<{}> | null = null;
const localDb = new PouchDB(`task-board-v1@${dbBaseName}`, { auto_compaction: true });

async function startSync() {
    if (remoteDb) {
        const localDocs = await localDb.allDocs({});
        const remoteDocs = remoteDb ? await remoteDb.allDocs({}) : null;
        const idSet = new Set<string>();
        for (const doc of localDocs.rows) {
            idSet.add(doc.id);
        }
        if (remoteDocs) {
            for (const doc of remoteDocs.rows) {
                idSet.add(doc.id);
            }
        }

        rep = localDb.sync(remoteDb, {
            live: true,
            retry: true,
            doc_ids: Array.from(idSet.values()),
        })
        .on('change', change => {
            // something changed!
        })
        .on('paused', info => {
            // replication was paused, usually because of a lost connection
        })
        .on('active' as any, info => {
            // TODO: TypeScript reports the error that parameter 'active' is invalid.
            // replication was resumed
        })
        .on('complete', info => {
            // replication was canceled!
        })
        .on('error', err => {
            // totally unhandled error (shouldn't happen)
        });
    }
}


export async function restartSync() {
    if (rep) {
        try {
            rep.cancel();
        } catch (e) {
            // ignore error
        }
        rep = null;
    }

    await startSync();
}

export function getLocalDb() {
    return localDb;
}
