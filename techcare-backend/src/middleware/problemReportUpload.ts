import { mkdirSync } from "fs";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { resolve } from "path";
import { randomUUID } from "crypto";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

const uploadDirectory = resolve(__dirname, "../../uploads");                                                                                                                        
mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([                                                                                                                                                                                                                                                      
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Only images, PDF, Word, and text files are allowed."));
      return;
    }
    callback(null, true);
  },
});

export function uploadProblemReportAttachments(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleAttachmentUpload(upload.array("attachments", 5), req, res, next);
}

export function uploadInternalChatAttachments(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleAttachmentUpload(upload.array("attachments", 5), req, res, next);
}

function handleAttachmentUpload(
  middleware: ReturnType<typeof upload.array>,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  middleware(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Each attachment must be 10 MB or smaller."
            : error.code === "LIMIT_FILE_COUNT"
              ? "A report can include up to 5 attachments."
              : "Unable to upload the report attachments.",
      });
      return;
    }

    if (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload the report attachments.",
      });
      return;
    }

    next();
  });
}
