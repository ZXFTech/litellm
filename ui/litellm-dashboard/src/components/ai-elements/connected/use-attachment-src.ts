"use client";

import { useEffect, useState } from "react";
import { useAuiState } from "@assistant-ui/react";

const useFileSrc = (file: File | undefined) => {
  const [entry, setEntry] = useState<{ file: File; url: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    // The object URL is a browser resource whose lifetime has to straddle
    // commit, so allocation, revocation, and clearing the entry that names a
    // revoked URL all belong to the effect.
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntry(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setEntry({ file, url: objectUrl });

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return entry !== undefined && entry.file === file ? entry.url : undefined;
};

export const useAttachmentSrc = () => {
  const file = useAuiState((state) => state.attachment.type === "image" ? state.attachment.file : undefined);
  const src = useAuiState((state) => state.attachment.type === "image" ? state.attachment.content?.find((part) => part.type === "image")?.image : undefined);

  return useFileSrc(file) ?? src;
};
