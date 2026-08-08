/**
 * Site CMS hooks — pages (+ nested blocks) and the media library. Block and
 * page-body mutations invalidate the parent page; publish is just an `update`
 * with `isPublished: true` (the deploy hook lives server-side).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { PagesService, MediaService } from "@/lib/services/cms-service"
import type { PageInput, PageBlockInput } from "@/lib/api/models"

/* ------------------------------------------------------------------ pages */

export function usePages() {
  return useQuery({
    queryKey: queryKeys.pages.all,
    queryFn: () => PagesService.list(),
    meta: { errorMessage: "Failed to load pages." },
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: queryKeys.pages.byId(id),
    queryFn: () => PagesService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Failed to load page." },
  })
}

export function useCreatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PageInput) => PagesService.create(input),
    meta: { successMessage: "Page created.", errorMessage: "Failed to create page." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.all })
    },
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: PageInput }) =>
      PagesService.update(vars.id, vars.input),
    meta: { successMessage: "Page saved.", errorMessage: "Failed to save page." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.byId(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.pages.all })
    },
  })
}

export function useDeletePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PagesService.remove(id),
    meta: { successMessage: "Page deleted.", errorMessage: "Failed to delete page." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.all })
    },
  })
}

/* ------------------------------------------------------------------ blocks */

export function useCreateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { pageId: string; input: PageBlockInput }) =>
      PagesService.createBlock(vars.pageId, vars.input),
    meta: { errorMessage: "Failed to add block." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.byId(vars.pageId) })
    },
  })
}

export function useUpdateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      pageId: string
      blockId: string
      input: Partial<PageBlockInput>
    }) => PagesService.updateBlock(vars.pageId, vars.blockId, vars.input),
    meta: { errorMessage: "Failed to update block." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.byId(vars.pageId) })
    },
  })
}

export function useReorderBlocks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { pageId: string; blockIds: string[] }) =>
      PagesService.reorderBlocks(vars.pageId, vars.blockIds),
    meta: { errorMessage: "Failed to reorder blocks." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.byId(vars.pageId) })
    },
  })
}

export function useDeleteBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { pageId: string; blockId: string }) =>
      PagesService.removeBlock(vars.pageId, vars.blockId),
    meta: { errorMessage: "Failed to delete block." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.byId(vars.pageId) })
    },
  })
}

/* ------------------------------------------------------------------ media */

export function useMedia() {
  return useQuery({
    queryKey: queryKeys.media.all,
    queryFn: () => MediaService.list(),
    meta: { errorMessage: "Failed to load media." },
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => MediaService.upload(file),
    meta: { successMessage: "Uploaded.", errorMessage: "Upload failed." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.media.all })
    },
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => MediaService.remove(id),
    meta: { successMessage: "Deleted.", errorMessage: "Failed to delete." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.media.all })
    },
  })
}
