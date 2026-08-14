/**
 * Site CMS transport — pages (+ their blocks) and the media library. Blocks are
 * managed as nested resources under a page. Media upload posts multipart form
 * data (the client interceptor drops the JSON Content-Type for FormData).
 */

import { apiClient } from "@/lib/api/client"
import { PageEndpoints, MediaEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type {
  Page,
  PageInput,
  PageBlock,
  PageBlockInput,
  MediaAsset,
} from "@/lib/api/models"

export class PagesService {
  static async list(): Promise<Page[]> {
    const res = await apiClient.get<ApiEnvelope<Page[]>>(PageEndpoints.list)
    return res.data.data
  }

  static async getById(id: string): Promise<Page> {
    const res = await apiClient.get<ApiEnvelope<Page>>(PageEndpoints.byId(id))
    return res.data.data
  }

  static async create(input: PageInput): Promise<Page> {
    const res = await apiClient.post<ApiEnvelope<Page>>(PageEndpoints.create, input)
    return res.data.data
  }

  static async update(id: string, input: PageInput): Promise<Page> {
    const res = await apiClient.put<ApiEnvelope<Page>>(
      PageEndpoints.update(id),
      input
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(PageEndpoints.remove(id))
  }

  /* -------------------------------------------------------------- blocks */

  static async createBlock(
    pageId: string,
    input: PageBlockInput
  ): Promise<PageBlock> {
    const res = await apiClient.post<ApiEnvelope<PageBlock>>(
      PageEndpoints.createBlock(pageId),
      input
    )
    return res.data.data
  }

  static async updateBlock(
    pageId: string,
    blockId: string,
    input: Partial<PageBlockInput>
  ): Promise<PageBlock> {
    const res = await apiClient.put<ApiEnvelope<PageBlock>>(
      PageEndpoints.updateBlock(pageId, blockId),
      input
    )
    return res.data.data
  }

  static async reorderBlocks(
    pageId: string,
    blockIds: string[]
  ): Promise<void> {
    // The API expects each block paired with its new zero-based order, not a
    // bare list of ids.
    await apiClient.put<ApiEnvelope<null>>(PageEndpoints.reorderBlocks(pageId), {
      blocks: blockIds.map((id, order) => ({ id, order })),
    })
  }

  static async removeBlock(pageId: string, blockId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(
      PageEndpoints.removeBlock(pageId, blockId)
    )
  }
}

export class MediaService {
  static async list(): Promise<MediaAsset[]> {
    const res = await apiClient.get<ApiEnvelope<MediaAsset[]>>(MediaEndpoints.list)
    return res.data.data
  }

  static async upload(file: File): Promise<MediaAsset> {
    const form = new FormData()
    form.append("file", file)
    const res = await apiClient.post<ApiEnvelope<MediaAsset>>(
      MediaEndpoints.upload,
      form
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(MediaEndpoints.remove(id))
  }
}
