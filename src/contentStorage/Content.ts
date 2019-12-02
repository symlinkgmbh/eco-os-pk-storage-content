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



import { MsContent } from "@symlinkde/eco-os-pk-models";

export class Content implements MsContent.IContent {
  public checksum: string;
  public key: string;
  public liveTime?: Date;
  public domain?: string;
  public maxOpen?: number;
  public openings?: number;
  public _id?: string;

  constructor(content: MsContent.IContent) {
    this.checksum = content.checksum;
    this.key = content.key;
    this.liveTime = content.liveTime;
    this.domain = content.domain;
    this.maxOpen = content.maxOpen;
    this.openings = content.openings;
    this._id = content._id;
  }

  public getChecksum(): string {
    return this.checksum;
  }

  public setChecksum(checksum: string): void {
    this.checksum = checksum;
  }

  public getKey(): string {
    return this.key;
  }

  public setKey(key: string): void {
    this.key = key;
  }

  public getLiveTime(): Date | null {
    return this.liveTime === undefined ? null : this.liveTime;
  }

  public setLiveTime(liveTime: Date | null): void {
    if (liveTime === null) {
      this.liveTime = new Date();
      return;
    }
    this.liveTime = liveTime;
  }

  public setDomain(domain: string): void {
    this.domain = domain;
  }

  public getDomain(): string {
    return this.domain === undefined ? "" : this.domain;
  }
}
