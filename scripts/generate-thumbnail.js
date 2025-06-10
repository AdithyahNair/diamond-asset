const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Path to your video file
const videoPath = path.join(__dirname, "../assets/nft-video-5sec.mp4");
const thumbnailPath = path.join(__dirname, "../assets/thumbnail.jpg");

// Use ffmpeg to extract first frame
exec(
  `ffmpeg -i ${videoPath} -vframes 1 -f image2 ${thumbnailPath}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error("Error generating thumbnail:", error);
      return;
    }
    console.log("Thumbnail generated successfully!");
    console.log("Thumbnail path:", thumbnailPath);
    console.log("\nNext steps:");
    console.log("1. Upload the thumbnail to IPFS using upload-file.js");
    console.log("2. Update metadata with the new thumbnail CID");
  }
);
