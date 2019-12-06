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



import { STORAGE_TYPES, storageContainer, AbstractBindings } from "@symlinkde/eco-os-pk-storage";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";
import Config from "config";
import { injectable } from "inversify";
import { Content } from "./Content";
import { PkStorage, PkStorageContent, MsContent } from "@symlinkde/eco-os-pk-models";

@injectable()
export class ContentService extends AbstractBindings implements PkStorageContent.IContentService {
  private contentRepo: PkStorage.IMongoRepository<Content>;

  public constructor() {
    super(storageContainer);

    this.initDynamicBinding(
      [STORAGE_TYPES.Database, STORAGE_TYPES.Collection, STORAGE_TYPES.StorageTarget],
      [Config.get("mongo.db"), Config.get("mongo.collection"), "SECONDLOCK_MONGO_CONTENT_DATA"],
    );

    this.initStaticBinding(
      [STORAGE_TYPES.SECONDLOCK_REGISTRY_URI],
      [bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI")],
    );

    this.contentRepo = this.getContainer().getTagged<PkStorage.IMongoRepository<Content>>(
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

  // tslint:disable-next-line: cyclomatic-complexity
  public async getContent(checksum: string): Promise<Content | null> {
    const result = await this.contentRepo.find({ checksum });

    if (result === null) {
      return result;
    }

    if (result.length < 1) {
      return null;
    }

    const content = new Content(result[0]);

    if (content.maxOpen && content.openings !== undefined && content._id) {
      content.openings += 1;
      await this.contentRepo.update(content._id, content);
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
