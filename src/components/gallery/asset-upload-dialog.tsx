"use client";

import * as React from "react";
import {
  CloudUpload,
  FileImage,
  FileVideo,
  Link2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "@/components/gallery/asset-media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createRemoteAsset, uploadAsset } from "@/lib/actions/assets";
import {
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
} from "@/lib/constants";
import type { Asset, PromptCatalogItem } from "@/lib/types";
import { cn, formatBytes, getExtension, parseTags } from "@/lib/utils";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const ALLOWED_EXT = new Set(["png", "jpg", "jpeg", "webp", "gif", "avif", "mp4", "webm", "mov"]);

export function AssetUploadDialog({
  open,
  onOpenChange,
  prompts,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: PromptCatalogItem[];
  onSaved: (asset: Asset) => void;
}) {
  const [mode, setMode] = React.useState<"upload" | "url">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [urlType, setUrlType] = React.useState<"image" | "video">("image");
  const [title, setTitle] = React.useState("");
  const [promptId, setPromptId] = React.useState("none");
  const [promptSnapshot, setPromptSnapshot] = React.useState("");
  const [seed, setSeed] = React.useState("");
  const [model, setModel] = React.useState("midjourney");
  const [category, setCategory] = React.useState("abstract");
  const [tags, setTags] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setMode("upload");
      setFile(null);
      setPreviewUrl(null);
      setUrl("");
      setTitle("");
      setPromptId("none");
      setPromptSnapshot("");
      setSeed("");
      setModel("midjourney");
      setCategory("abstract");
      setTags("");
      setError(null);
      setDragging(false);
    }
    // We intentionally reset only when the dialog closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile(nextFile: File | null) {
    setError(null);
    if (!nextFile) return;
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("文件超过 30MB，请压缩后重试。");
      return;
    }
    if (!ALLOWED_EXT.has(getExtension(nextFile.name))) {
      setError("暂不支持该格式，请上传 PNG / JPG / WebP / GIF / AVIF / MP4 / WebM。");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    if (!title.trim()) {
      setTitle(nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120));
    }
  }

  function onPromptChange(value: string) {
    setPromptId(value);
    if (value === "none") return;
    const prompt = prompts.find((item) => item.id === value);
    if (prompt) {
      setPromptSnapshot(prompt.promptZh || prompt.promptEn);
      setModel(prompt.model);
      if (!title.trim()) setTitle(prompt.title);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "upload" && !file) {
      setError("请先选择要上传的图片或视频。");
      return;
    }
    if (mode === "url") {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      } catch {
        setError("请填写有效的 http(s) 素材地址。");
        return;
      }
    }

    setSubmitting(true);
    try {
      let result;
      if (mode === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("promptId", promptId === "none" ? "" : promptId);
        formData.append("promptSnapshot", promptSnapshot);
        formData.append("seed", seed);
        formData.append("model", model);
        formData.append("category", category);
        formData.append("tags", tags);
        result = await uploadAsset(formData);
      } else {
        result = await createRemoteAsset({
          title,
          type: urlType,
          source: "url",
          url,
          promptId: promptId === "none" ? null : promptId,
          promptSnapshot,
          seed,
          model,
          category,
          tags: parseTags(tags),
          params: {},
          width: null,
          height: null,
        });
      }

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(mode === "upload" ? "资产已存入本地画廊" : "URL 资产已收录");
      onSaved(result.data);
      onOpenChange(false);
    } catch {
      setError("保存失败，请稍后重试。");
      toast.error("保存失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPrompt =
    promptId !== "none" ? prompts.find((prompt) => prompt.id === promptId) : null;
  const fileIsVideo = file?.type.startsWith("video/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-6 pb-4 pt-6">
          <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
            <Upload className="size-3" />
            Ingest asset
          </div>
          <DialogTitle>收录一个 AIGC 资产</DialogTitle>
          <DialogDescription>
            上传本地文件，或引用外部 URL。Prompt、Seed 与模型参数会一起归档，形成可追溯的创作记录。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 px-6 pb-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "upload" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <CloudUpload className="size-3.5" />
                上传文件
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="size-3.5" />
                引用 URL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {error ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
              {error}
            </div>
          ) : null}

          {mode === "upload" ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                pickFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 text-center transition-colors",
                dragging
                  ? "border-brand/50 bg-brand/[0.07]"
                  : "border-border bg-background/30 hover:border-foreground/20",
              )}
            >
              {file && previewUrl ? (
                <>
                  <div className="relative h-48 w-full overflow-hidden rounded-lg bg-black/40">
                    {fileIsVideo ? (
                      <video
                        src={previewUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <SmartImage src={previewUrl} alt={file.name} fit="contain" sizes="640px" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/75 hover:bg-black/70 hover:text-white"
                    aria-label="移除文件"
                  >
                    <X className="size-3.5" />
                  </button>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                    {fileIsVideo ? <FileVideo className="size-3.5" /> : <FileImage className="size-3.5" />}
                    {file.name} · {formatBytes(file.size)}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-border bg-card text-brand">
                    <CloudUpload className="size-5" />
                  </div>
                  <div className="text-[12.5px] font-medium">拖拽文件到这里，或点击选择</div>
                  <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                    PNG · JPG · WebP · GIF · AVIF · MP4 · WebM，最大 30MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => inputRef.current?.click()}
                  >
                    选择文件
                  </Button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-border/70 bg-background/30 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-1.5">
                  <Label htmlFor="asset-url">素材 URL</Label>
                  <Input
                    id="asset-url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://images.example.com/result.webp"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>类型</Label>
                  <div className="flex h-9 rounded-lg border border-border bg-secondary/40 p-0.5">
                    {(["image", "video"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUrlType(type)}
                        className={cn(
                          "rounded-md px-2.5 text-[10px] transition-colors",
                          urlType === type
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {type === "image" ? "图像" : "视频"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                外部 URL 仅记录引用，不会复制文件。本地优先建议上传关键素材，避免链接失效。
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="asset-title">标题</Label>
              <Input
                id="asset-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="给这件资产一个可检索的名字"
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>关联 Prompt（可选）</Label>
              <Select value={promptId} onValueChange={onPromptChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择 Prompt 库中的配方" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不关联 Prompt</SelectItem>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPrompt ? (
                <p className="line-clamp-2 rounded-md border border-border/60 bg-background/30 px-2.5 py-1.5 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
                  {selectedPrompt.promptZh || selectedPrompt.promptEn}
                </p>
              ) : null}
            </div>

            {!selectedPrompt ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="asset-snapshot">Prompt 快照（可选）</Label>
                <Textarea
                  id="asset-snapshot"
                  value={promptSnapshot}
                  onChange={(event) => setPromptSnapshot(event.target.value)}
                  placeholder="粘贴生成这张图所使用的 Prompt…"
                  className="min-h-16 font-mono text-[11px]"
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="asset-seed">Seed</Label>
              <Input
                id="asset-seed"
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                placeholder="例如 884120934"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>模型</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>分类</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asset-tags">标签</Label>
              <Input
                id="asset-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="赛博朋克, 雨夜"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" variant="brand" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Upload />}
              {submitting ? "正在归档…" : "存入画廊"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
