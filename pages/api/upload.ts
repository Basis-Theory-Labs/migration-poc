// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Client from "ssh2-sftp-client";
import path from "path";

const sftp = new Client();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [username, host] = (process.env.SFTP_INBOUND_HOST as string).split("@");

  await sftp.connect({
    host,
    username,
    password: process.env.SFTP_PASSWORD,
    debug: console.debug,
  });

  const { file } = req.query;

  try {
    const result = await sftp.put(
      path.join(process.cwd(), "inbound", file as string),
      `/${file}`
    );

    res.status(200).json({ result });
  } finally {
    await sftp.end();
  }
}
