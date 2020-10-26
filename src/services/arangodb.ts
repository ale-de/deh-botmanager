import {Injectable, Logger} from '@nestjs/common';
import {Database, aql} from 'arangojs';
import to from 'await-to-js';
import {BehaviorSubject, Subject} from 'rxjs';
import {ArangoError, isArangoError} from "arangojs/error";
import {Config} from "arangojs/connection";
import {inspect} from "util";

@Injectable()
export class Arangodb {
    private _db: Database;
    isAlive: boolean = false;
    private _collections: {} = {};
    onStarted: BehaviorSubject<any> = new BehaviorSubject(false);

    get dbase() {return this._db};
    get collection() {
        return this._collections
    };

    constructor(dbName,collections, dbLogin='',dbPw='', host = '127.0.0.1') {
        this.init(dbName,collections, dbLogin, dbPw, host);
    }
    async setupDB(dbName, collections,host = '127.0.0.1') {
        this._db.useDatabase(dbName);
        let err, cs:any; [err, cs] = await to(this._db.listCollections());
        if (!err) {
            Logger.log('Setting up DB resources (possibly recovered connection error)', this.constructor.name);
            cs = cs.map(e => e.name);
            for (let collection1 of Object.values(collections)) {
                let collection: any = collection1;
                this._collections[collection] = this._db.collection(collection);
                if (cs.indexOf(collection) === -1) {
                    this._collections[collection].create().then(
                        () => Logger.log('Collection ' + collection + ' created', this.constructor.name),
                        err => Logger.error(`Failed to create collection ${collection}:`, '', this.constructor.name),
                    );
                } else {
                    Logger.log(`Collection ${collection} already existing`, this.constructor.name);
                }
            }
            this.onStarted.next(true);
        }
    }

    async init(dbName, collections, dbLogin='',dbPw='', host = '127.0.0.1'): Promise<Arangodb> {
        Logger.log(`init db: name:${dbName}, collections:${collections.toString()},login:${dbLogin}/${dbPw}`,this.constructor.name);
        //this._db = new Database('http://' + host + ':8529');
        //this._db.useDatabase(dbName);
        let config: Config = {
            url: `http://${host}:8529`,
            databaseName: dbName
        }
        this._db = new Database(config);
        let err:any, res; [err, res] = await to(this._db.login(dbLogin,dbPw));
        if (err && !res) {
            Logger.error(`DB login error`,isArangoError(err)?inspect(err.message):inspect(err), this.constructor.name);
        } else {
            Logger.log(`Connected and logged into ArangoDB on ${host}`, this.constructor.name)
        }

/*        [err, res] = await to(this._db.version());
        if (err) {
            Logger.error('DB Connection error',inspect(err), this.constructor.name);
        } else {
            Logger.log(`Connected to ArangoDB on ${host}`, this.constructor.name)
        }*/
        //Poll every second to see if DB is up and running
        setInterval(() => {
            this._db.version().then(res => {
                if (!this.isAlive) {
                    this._db.login(dbLogin,dbPw).then(data=>{
                        this.setupDB(dbName,collections);
                    }).catch(err=>Logger.error('[WD] :: DB Login error', '', this.constructor.name));

                }
                this.isAlive = true;
            }).catch(err => { if (this.isAlive) Logger.warn("[WD] :: Lost connectivity to DB", this.constructor.name); this.isAlive = false;})
        }, 1000);
        return this;
    }

    async getAll(collectionName): Promise<[any, any]> {
        let err, cursor:any; [err,cursor] = await to(this.collection[collectionName].all());
        return [err, await cursor.all()];
    }

    async save(collectionName, data): Promise<[any, any]> {
        let err:any, res; [err, res] = await to(this.collection[collectionName].save(data));
        //if (err) err = err.response.body;
        return [err, res];
    }

    async delete(collectionName, criteria): Promise<[any, any]> {
        let err:any, res; [err, res] = await to(this.collection[collectionName].removeByExample(criteria));
        //if (err) err = err.response.body;
        return [err, res];
    }

    async find(collectionName, condition): Promise<any[]> {
        let err, cursor:any;
        [err,cursor] = await to(this._collections[collectionName].byExample(condition));
        return [err, await cursor.all()];
    }

    async findOne(collectionName, condition): Promise<[any, any]> {
        let [err,object] = await to(this._collections[collectionName].firstExample(condition));
        //debug.log('findOne error');
        //if (err) console.log(err);
        return [err,object];
    }

    async findByKey(collectionName, key): Promise<ADB_RESULT> {
        let err: ArangoError, result:any;
        [err,result] = await to(this._collections[collectionName].lookupByKeys([key]));
        //debug.log('findOne error');
        //if (err) console.log(err);
        return [err, result];
    }
    //FOR doc IN @@collection FILTER doc._key IN @keys RETURN doc
    async findByKeyAQL(collectionName, key): Promise<ADB_RESULT> {
        let err: ArangoError, result:any;
        [err,result] = await this.aqlQuery(`FOR doc IN @@collection FILTER doc._key IN ['${key}'] RETURN doc`, collectionName);
        return [err,await result];
    }

    async replaceDocument(collectionName,condition, values) {
        let [err,object] = await to(this._collections[collectionName].replaceByExample(condition, values));
        return [err, object];
    }

    async updateDocument(collectionName,condition, values): Promise<[any, any]> {
        let [err,object] = await to(this._collections[collectionName].updateByExample(condition, values));
        return [err, object];
    }

    async bulkUpdateDocuments(collectionName, data,options={}) {
        let [err,object] = await to(this._collections[collectionName].bulkUpdate(data, options));
        return [err, object];
    }


    async remove(collectionName, document) {
        let [err, object] = await to(this._collections[collectionName].remove(document));
        return [err, object];
    }

    async getQuery(collection, filter) {
        let e,cursor:any; [e,cursor] = await to(this._db.query(
            "FOR doc IN @@collection FILTER " + filter + " RETURN doc",
            {'@collection':collection}));
        let res=null;
        if (!e) res = await cursor.all();
        //if (res.length==0) e={response:{body:{errorMessage:"getQuery: Nothing found"}}};
        //debug.log("getQuery",{err:e,res:res});
        return [e?e.response.body.errorMessage:null, e?null:res];
    }
    async aqlQuery(query, collection?): Promise<ADB_RESULT> {
        let e: ArangoError, cursor:any;
        [e, cursor] = await to(this._db.query(
            query,
            collection?{'@collection': collection}:{}
        ));
        let res = [];
        if (!e) {
            res = await cursor.all();
            if (res.length == 0) {
                let e2 = {
                    code: 0,
                    errorNum: 0,
                    isArangoError: false,
                    message: "getRawQuery: Nothing found",
                    name: "",
                    stack: "",
                    statusCode: 0,
                    response: {body: {errorMessage: "getRawQuery: Nothing found"}}
                };
               e.message = e2.message;
               e.response = e2.response;
            }
        }
        //debug.log("getQuery",{err:e,res:res});
        return [e ? e : null, e ? null : res];
    }

}

export type ADB_RESULT = [ArangoError,any]
// MACOS: To remove the lock file preventing arangodb to start: rm /usr/local/var/lib/arangodb3/LOCK
