import { Button } from "@/components/ui/button";
import { HfInference } from "@huggingface/inference";
import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Aperture,
  Camera,
  FlipHorizontal,
  RefreshCcw,
  Wand2,
} from "lucide-react";

function App() {
  const [showCamera, setShowCamera] = useState(false);

  const toggleCamera = () => {
    setShowCamera((prevShowCamera) => !prevShowCamera);
  };

  return (
    <div className="">
      {!showCamera && <Button
        variant={"default"}
        className="fixed bottom-5 right-5 w-12 h-12"
        size={"icon"}
        onClick={toggleCamera}
      >
        <Camera />
      </Button>}

      {showCamera ? <CustomWebcam /> : <WebCamNo />}
    </div>
  );
}

const WebCamNo = () => {
  return (
    <div className="h-screen bg-foreground flex justify-center space-y-2 flex-col items-center">
      <h2 className="text-center font-mono text-sm text-primary-foreground opacity-40">
        Please click the camera icon in the bottom right to get started
      </h2>
      <h1 className="font-semibold text-center font-mono text-primary-foreground text-2xl">
        Welcome to RoboLens
      </h1>
      <h1 className="font-mono text-center text-primary-foreground opacity-90 text-lg">
        Designed and developed with ❤️ by Usman Tanveer
      </h1>
    </div>
  );
};

const CustomWebcam = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [mirrored, setMirrored] = useState(true);
  const [caption, setCaption] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const mirror = () => {
    setMirrored(!mirrored);
  };

  const captionate = async () => {
    const HF_TOKEN = "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";

    const inference = new HfInference(HF_TOKEN);

    const model = "nlpconnect/vit-gpt2-image-captioning";
    const img = imgSrc;

    if (img) {
      const response = await fetch(img);
      const imgBlob = await response.blob();

      const result = await inference.imageToText({
        data: imgBlob,
        model: model,
      });

      setCaption(result.generated_text);
      console.log(caption);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { width, height } = windowSize;

  let webcamWidth = width;
  let webcamHeight = height;
  console.log(windowSize);

  return (
    <div className="flex h-screen bg-foreground text-primary-foreground  flex-col space-y-20 items-center justify-center p-0">
      <div className="flex  flex-col justify-center items-center space-y-4">
        {imgSrc ? (
          <img src={imgSrc} className="opacity-80" alt="webcam" />
        ) : (
          <Webcam
            className="opacity-80"
            height={webcamWidth}
            width={webcamHeight}
            audio={false}
            mirrored={mirrored}
            ref={(webcam) => {
              if (webcam) {
                webcamRef.current = webcam;
              }
            }}
            screenshotQuality={0.8}
          />
        )}
        {imgSrc ? (
          <div className="flex flex-row space-x-2">
            <Button onClick={retake}>
              <RefreshCcw />
            </Button>
            <Button onClick={captionate}>
              <Wand2 />
            </Button>
          </div>
        ) : (
          <div className="flex flex-row space-x-2">
            <Button onClick={capture}>
              <Aperture />
            </Button>
            <Button onClick={mirror}>
              <FlipHorizontal />
            </Button>
          </div>
        )}
      </div>
      <div className="bottom-5 fixed">
        <h1 className="font-mono text-center font-medium opacity-90 text-primary-foreground">
          {caption ? (
            caption
          ) : (
            <span className="opacity-70">
              Please take an image to generate a caption
            </span>
          )}
        </h1>
      </div>
    </div>
  );
};

export default App;
