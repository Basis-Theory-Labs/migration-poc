// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Client from "ssh2-sftp-client";

const sftp = new Client();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [username, host] = (process.env.SFTP_OUTBOUND_HOST as string).split(
    "@"
  );

  await sftp.connect({
    host,
    username,
    password: process.env.SFTP_PASSWORD,
    debug: console.debug,
  });

  try {
    const list = await sftp.list("/");

    await Promise.all(
      list.map(async ({ name }) => {
        await sftp.get(`/${name}`, process.stdout);
        await sftp.delete(`/${name}`);
      })
    );

    res.status(200).json({ list });
  } finally {
    await sftp.end();
  }
}
