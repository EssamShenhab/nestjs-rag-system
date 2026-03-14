export interface VectorDBInterface {
  // readonly default_vector_size: number;
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  isCollectionExisted(collection_name: string): Promise<boolean>;

  listAllCollections(): Promise<string[]>;

  getCollectionInfo(collection_name: string): Promise<any>;

  deleteCollection(collection_name: string): Promise<void>;

  createCollection(
    collection_name: string,
    embedding_size: number,
    do_reset?: boolean,
  ): Promise<boolean>;

  insertOne(
    collection_name: string,
    text: string,
    vector: number[],
    metadata: any,
    record_id: string,
  ): void;

insertMany(
  collection_name: string,
  texts: string[],
  vectors: number[][],
  metadata?: any[],
  record_ids?: number[],
  batch_size?: number,
): Promise<boolean>;

  searchByVector(
    collection_name: string,
    vector: number[],
    limit?: number,
  ): Promise<any[]>;
}
