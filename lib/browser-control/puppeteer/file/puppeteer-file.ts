// export async function pollForNewFile(
//   beforeFiles: Deno.DirEntry[],
//   downloadFolder: string,
//   attempts: number = 5,
//   waitMs: number = 1000,
// ): Promise<string> {
//   let attemptsLeft = attempts;
//   while (attemptsLeft > 0) {
//     attemptsLeft--;
//
//     const currentFiles = [...Deno.readDirSync(downloadFolder)];
//     const downloadedFile = currentFiles.find((file) =>
//       !beforeFiles.some((beforeFile) => beforeFile.name === file.name)
//     );
//
//     if (downloadedFile) {
//       return `${downloadFolder}/${downloadedFile.name}`;
//     }
//
//     await new Promise((resolve) => setTimeout(resolve, waitMs));
//   }
//
//   throw new Error('No new file found');
// }
