import formidable, { errors as formidableErrors } from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Blob as BlobConstructor } from "buffer";

import fs from "fs";

type ResponseData = {
  success: boolean;
};

type Error = {
  error: string;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests allowed" });
  }

  return uploadFile(req).then(({ success }) => {
    if (success) {
      res.status(200).send({ success });
    }

    return res.status(400).send({ success });
  });
}

const uploadFile = async (req: NextApiRequest) => {
  const form = formidable({});
  try {
    const [fields, files] = await form.parse(req);

    const { customerId, corpusId } = fields;

    const file = files["file"]?.[0];

    if (!customerId || !corpusId || !file) {
      return { success: false };
    }

    const formData = new FormData();
    const buffer = fs.readFileSync(file.filepath);
    const blobber = new BlobConstructor([buffer]);
    formData.append("file", blobber as Blob, file.originalFilename as string);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api.vectara.io/v1/upload?c=${customerId[0]}&o=${corpusId}`,
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        "x-api-key": process.env.TEST_API_KEY,
      },
      data: formData,
    };

    await axios(config);
    return { success: true };
  } catch (err: any) {
    // example to check for a very specific error
    if (err.code === formidableErrors.maxFieldsExceeded) {
    }
    console.error(err);
    return { success: false };
  }
  return { success: false };
};
