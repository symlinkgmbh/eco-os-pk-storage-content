/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */

 
import { STORAGE_TYPES, storageContainer } from "@symlinkde/eco-os-pk-storage";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";
import Config from "config";
import { injectable } from "inversify";
import { Content } from "./Content";
import { PkStorage, PkStorageContent, MsContent } from "@symlinkde/eco-os-pk-models";

@injectable()
export class ContentService implements PkStorageContent.IContentService {
  private contentRepo: PkStorage.IMongoRepository<Content>;

  public constructor() {
    storageContainer.bind(STORAGE_TYPES.Collection).toConstantValue(Config.get("mongo.collection"));
    storageContainer.bind(STORAGE_TYPES.Database).toConstantValue(Config.get("mongo.db"));
    storageContainer.bind(STORAGE_TYPES.StorageTarget).toConstantValue("SECONDLOCK_MONGO_CONTENT_DATA");
    storageContainer
      .bind(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI)
      .toConstantValue(bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI"));
    this.contentRepo = storageContainer.getTagged<PkStorage.IMongoRepository<Content>>(
      STORAGE_TYPES.IMongoRepository,
      STORAGE_TYPES.STATE_LESS,
      false,
    );
  }

  public async addContent(content: MsContent.IContent): Promise<Content | null> {
    const result = await this.contentRepo.create(new Content(content));
    if (!result) {
      return null;
    }

    return result;
  }

  public async getContent(checksum: string): Promise<Content | null> {
    const result = await this.contentRepo.find({ checksum });

    if (result === null) {
      return result;
    }

    if (result.length < 1) {
      return null;
    }

    return new Content(result[0]);
  }

  public async getContentByDomain(domain: string): Promise<Array<Content>> {
    const result = await this.contentRepo.find({ domain });
    if (result === null) {
      return [];
    }

    return result;
  }

  public async revokeOutdatedContent(): Promise<boolean> {
    return await this.contentRepo.deleteMany({
      liveTime: {
        $lt: new Date(),
      },
    });
  }
}
