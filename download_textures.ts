import https from "https";
import fs from "fs";

fs.mkdirSync("public/textures", { recursive: true });

function download(url: string, dest: string) {
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${url}: ${res.statusCode}`);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log(`Downloaded ${dest}`);
    });
  }).on("error", (err) => {
    console.error(`Error downloading ${url}: ${err.message}`);
  });
}

download("https://www.solarsystemscope.com/textures/download/2k_saturn.jpg", "public/textures/saturn.jpg");
download("https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png", "public/textures/saturn_ring.png");
