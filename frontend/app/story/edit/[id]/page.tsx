"use client";

// Import puck components
import "@puckeditor/core/puck.css";
import { Puck, Config, Data } from "@puckeditor/core";

// Import next components
import Image from "next/image";
import Link from "next/link";

// Import react component
import { useEffect, useState, useTransition, use } from "react";

// Import icons
import { BookType, Text, Loader2 } from "lucide-react";

// Import components props
import { TitleProps, TextProps, SlotProps, ImageProps, FlexContainerProps } from "@/components/story/edit/types";
import { SlotComponent } from "@/components/story/edit/components/slotComponent";

// Import components renders
import { ImageComponent } from "@/components/story/edit/components/imageComponent";
import { FlexComponent, justifyOptions } from "@/components/story/edit/components/flexComponent";

// Import fields
import { spacingField, defaultSpacing, resolvePixelStyles } from "@/components/story/edit/fields/spacing";
import { typographyField, defaultTypography, defaultTypographyHeader, resolveTypographyStyles } from "@/components/story/edit/fields/typography";
import { resizeField, defaultSize } from "@/components/story/edit/fields/size";
import { cropField, defaultCrop } from "@/components/story/edit/fields/crop";

// Import API services
import { createStoryPage, saveStoryPageData, loadStoryPageData } from "@/services/story";

// Import Auth
import { useAuth } from "@/context/auth-context";
import AuthGuard from "@/components/auth-guard";

type EditStoryConfig = Config<{
  Title: TitleProps;
  Text: TextProps;
  Slot: SlotProps;
  Image: ImageProps;
  Container: FlexContainerProps;
}>;

/**
 * Puck editor component configuration.
 *
 * Defines the available drag-and-drop components, their editable fields,
 * default props, and render functions. This object is static and created
 * once at module level — it does not depend on any runtime state.
 *
 * Components:
 * - `Title`     — Styled heading with typography and spacing controls.
 * - `Text`      — Multi-line paragraph with typography and spacing controls.
 * - `Slot`      — Responsive grid container with up to 3 configurable column slots.
 * - `Image`     — Image with URL, alt text, resize, crop, and spacing controls.
 * - `Container` — Flexbox wrapper with direction, justification, and spacing controls.
 */
const config: EditStoryConfig = {
  components: {
    Title: {
      fields: {
        title: {
          type: "text",
          label: "Title",
          labelIcon: <BookType size={16} />,
        },
        typography: typographyField,
        spacing: spacingField,
      },
      defaultProps: {
        title: "My Story",
        typography: { ...defaultTypographyHeader },
        spacing: { ...defaultSpacing },
      },
      render: ({ title, typography, spacing }) => (
        <h2
          className="font-bold tracking-tight text-slate-950"
          style={{
            ...resolveTypographyStyles(typography),
            ...resolvePixelStyles(spacing),
          }}
        >
          {title}
        </h2>
      ),
    },
    Text: {
      fields: {
        text: {
          type: "textarea",
          label: "Text",
          labelIcon: <Text size={16} />,
          contentEditable: true,
        },
        typography: typographyField,
        spacing: spacingField,
      },
      defaultProps: {
        text: "This is a paragraph of text.",
        typography: defaultTypography,
        spacing: defaultSpacing,
      },
      render: ({ text, typography, spacing }) => (
        <div style={{
          ...resolveTypographyStyles(typography),
          ...resolvePixelStyles(spacing),
        }}>{text}</div>
      ),
    },
    Slot: {
      fields: {
        columns: {
          type: "select",
          label: "Grid Columns",
          options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
          ],
        },
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
        spacing: spacingField,
      },
      defaultProps: {
        columns: "1",
        spacing: defaultSpacing,
      },
      render: (props) => <SlotComponent {...props} />,
    },
    Image: {
      fields: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        resize: resizeField,
        crop: cropField,
        spacing: spacingField,
      },
      defaultProps: {
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
        alt: "Story Image",
        resize: defaultSize,
        crop: defaultCrop,
        spacing: defaultSpacing,
      },
      render: (props) => <ImageComponent {...props} />,
    },
    Container: {
      fields: {
        direction: {
          type: "select",
          label: "Direction",
          options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
          ],
        },
        spacing: spacingField,
        slot: { type: "slot" },
        justify: {
          label: "Justify",
          type: "select",
          options: justifyOptions,
        },
      },
      render: (props) => <FlexComponent {...props} />,
    },
  },
};

interface StoryEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * StoryEditContent
 *
 * The authenticated inner shell of the story editor. Handles workspace
 * initialization, data loading, and saving. Rendered only after `AuthGuard`
 * confirms a valid session, so `accessToken` is guaranteed to be non-null
 * once this component mounts.
 *
 * Initialization logic (runs on mount and whenever `accessToken` changes):
 * - If `pageId` is `"new"`, creates a fresh page record on the backend with a
 *   collision-proof slug, then rewrites the URL to the new record's CUID so a
 *   subsequent reload loads the existing page rather than creating another one.
 * - Otherwise, fetches the existing page's Puck layout data by ID.
 *
 * @param params - Next.js dynamic route params containing the page `id`.
 */
function StoryEditContent({ params }: StoryEditPageProps) {
  const resolvedParams = use(params);
  const pageId = resolvedParams.id;

  const { accessToken } = useAuth();

  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Initializes the editor workspace for the current page ID.
     *
     * Bails early if either `pageId` or `accessToken` is absent — the latter
     * can be null on first render before the silent refresh completes, in which
     * case the effect re-runs automatically once the token arrives.
     *
     * The slug for new pages includes both a timestamp and a random suffix to
     * prevent unique constraint collisions from React StrictMode's double-invoke
     * behaviour in development.
     */
    async function initPageWorkspace() {
      if (!pageId || !accessToken) return;
      try {
        setIsLoading(true);

        if (pageId === "new") {
          const fallbackSlug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const newPageRecord = await createStoryPage("Untitled Story Draft", fallbackSlug, accessToken);
          window.history.replaceState(null, "", `/story/edit/${newPageRecord.id}`);
          setData(newPageRecord.puckData);
          return;
        }

        const pageData = await loadStoryPageData(pageId, accessToken);
        setData(pageData || { content: [], root: { props: { title: "Untitled Page" } } });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to properly initialize editor data");
      } finally {
        setIsLoading(false);
      }
    }

    initPageWorkspace();
  }, [pageId, accessToken]);

  /**
   * Persists the current Puck layout to the backend.
   *
   * Reads the page ID from the URL rather than from `pageId` in state, since
   * a "new" page has its URL rewritten to the real CUID after creation and
   * `pageId` in state would still read `"new"` until the next render.
   *
   * Wrapped in `startSaving` (a `useTransition`) so the saving state is
   * non-blocking and the UI remains interactive during the request.
   *
   * @param currentData - The current Puck `Data` object to persist.
   */
  const handleSaveWorkspace = (currentData: Data) => {
    const actualId = window.location.pathname.split("/").pop();
    if (!actualId || actualId === "new" || !accessToken) return;

    startSaving(async () => {
      try {
        await saveStoryPageData(actualId, currentData, accessToken);
      } catch (err: any) {
        alert(`Error trying to update data record: ${err.message}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#1A1A2E] flex items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span>Syncing Canvas Workspace...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-screen bg-[#1A1A2E] flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#1A1A2E]">
      <Puck
        config={config}
        data={data}
        onChange={(newData) => setData(newData)}
        onPublish={handleSaveWorkspace}
        overrides={{
          puck: ({ children }) => (
            <div style={{ height: "100%", maxHeight: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#FFB7C3" }}>
              {children}
            </div>
          ),
          header: ({ children }) => (
            <div className="bg-[#FFB7C3] p-3 flex justify-between items-center text-slate-800 border-b border-slate-200/20">
              <div className="w-full flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/logo-text.svg"
                    alt="Menata Ulang Logo"
                    width={128}
                    height={128}
                    priority
                    className="w-auto h-8 brightness-0"
                  />
                </Link>
                <h1 className="font-bold text-lg">Story Editor</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveWorkspace(data)}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}

/**
 * StoryEditPage
 *
 * Public-facing page export for the story editor route (`/story/edit/[id]`).
 * Wraps `StoryEditContent` in `AuthGuard` to ensure unauthenticated users are
 * redirected to `/login` before the editor attempts to load or save any data.
 *
 * @param params - Next.js dynamic route params containing the page `id`.
 */
export default function StoryEditPage({ params }: StoryEditPageProps) {
  return (
    <AuthGuard>
      <StoryEditContent params={params} />
    </AuthGuard>
  );
}
