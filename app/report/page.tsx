/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Upload, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import { Libraries } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  getUserByEmail,
  createReport,
  getRecentReports,
} from "@/utils/db/actions";

const geminiApiKey = process.env.GEMINI_API_KEY ?? "";
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

const libraries: Libraries = ["places"];

export default function ReportPage() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [reports, setReports] = useState<
    Array<{
      id: number;
      location: string;
      wasteType: string;
      amount: string;
      createdAt: string;
    }>
  >([]);

  const [newReport, setNewReport] = useState({
    location: "",
    wasteType: "",
    amount: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: string;
    confidence: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleMapsApiKey ?? "",
    libraries: libraries,
  });

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlaceChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        setNewReport((prev) => ({
          ...prev,
          location: place.formatted_address || "",
        }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  };

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // verify waste type and amount using Gemini
  const handleVerify = async () => {
    if (!file) return;

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey ?? "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64data = await readFileAsBase64(file);
      const imageParts = [
        {
          inlineData: {
            data: base64data.split(",")[1],
            mimeType: file.type,
          },
        },
      ];

      const prompt = `Imagine you are an expert in waste management and recycling. Analyse the image in this manner: 
            1. The type of waste (eg plastic, paper, metal, organic, etc.)
            2. The approximate quantity of waste (eg in kg or litres)
            3. Your confidence level in your analysis (0-100%)
            Please provide your analysis in the following JSON format:
            {
                "wasteType": "type of waste",
                "quantity": "approximate quantity",
                "confidence": confidence level (0-100)
            }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      //trying to fix the JSON parsing issue
      let jsonString = text.trim();
      if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/```json|```/g, "").trim();
      }

      try {
        const parsedResult = JSON.parse(jsonString);
        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          parsedResult.confidence
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
          setNewReport({
            ...newReport,
            wasteType: parsedResult.wasteType,
            amount: parsedResult.quantity,
          });
        } else {
          console.error("Invalid verification result", parsedResult);
          setVerificationStatus("failure");
        }
      } catch (e) {
        console.error("Failed to parse JSON response", e, jsonString);
        setVerificationStatus("failure");
      }
    } catch (e) {
      console.error("Error verifying waste", e);
      setVerificationStatus("failure");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== "success" || !user) {
      toast.error(
        "Please verify the waste type and amount before submitting or log in first",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await createReport(
        user.id,
        newReport.location,
        newReport.wasteType,
        newReport.amount,
        preview || undefined,
        verificationResult ? JSON.stringify(verificationResult) : undefined,
      );

      if (!report) {
        throw new Error("Report creation failed: report is null");
      }
      const formattedReport = {
        id: report.id,
        location: report.location,
        wasteType: report.wasteType,
        amount: report.amount,
        createdAt: report.createdAt.toISOString().split("T")[0],
      };

      setReports([formattedReport, ...reports]);
      setNewReport({ location: "", wasteType: "", amount: "" });
      setFile(null);
      setPreview(null);
      setVerificationStatus("idle");
      setVerificationResult(null);

      toast.success(`Report submitted successfully! You earned points.`);
    } catch (e) {
      console.error("Error submitting report", e);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        const userObj = await getUserByEmail(email);
        setUser(userObj);

        const recentReports = await getRecentReports();

        if (
          recentReports &&
          Array.isArray(recentReports) &&
          recentReports.length > 0
        ) {
          const formattedReports = recentReports.map((report) => ({
            ...report,
            createdAt: report.createdAt.toISOString().split("T")[0],
          }));
          setReports(formattedReports);
        }
      } else {
        //show login prompt and redirect to homepage
        toast.error("Please log in to report waste.");
        setTimeout(() => {
          router.push("/");
        }, 1500); //1.5 second delay
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold eco-gradient-text mb-2">
            Report Waste
          </h1>
          <p className="text-lg text-gray-600">
            Help keep your community clean by reporting waste incidents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="eco-card p-8 mb-12">
          <div className="mb-8">
            <label
              htmlFor="waste-image"
              className="block text-lg font-semibold text-gray-800 mb-3 flex items-center"
            >
              📷 Upload Waste Image
              <span className="ml-2 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                AI Powered
              </span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-green-300 border-dashed rounded-2xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group">
              <div className="space-y-2 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex text-base text-gray-700 font-medium">
                  <label
                    htmlFor="waste-image"
                    className="relative cursor-pointer bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                  >
                    <span>Choose File</span>
                    <input
                      id="waste-image"
                      name="waste-image"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-3 self-center text-gray-600">
                    or drag and drop
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB • AI will analyze automatically
                </p>
              </div>
            </div>
          </div>

          {preview && (
            <div className="mt-4 mb-8">
              <img
                src={preview}
                alt="Waste Preview"
                className="max-w-full h-auto rounded-xl shadow-md"
              />
            </div>
          )}

          <Button
            type="button"
            onClick={handleVerify}
            className="w-full mb-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            disabled={!file || verificationStatus === "verifying"}
          >
            {verificationStatus === "verifying" ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                🤖 AI Analyzing...
              </>
            ) : (
              "🔍 Verify with AI"
            )}
          </Button>

          {verificationStatus === "success" && verificationResult && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-green-800">
                    Verification Successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Waste Type: {verificationResult.wasteType}</p>
                    <p>Quantity: {verificationResult.quantity}</p>
                    <p>
                      Confidence:{" "}
                      {verificationResult.confidence > 1
                        ? verificationResult.confidence.toFixed(2)
                        : (verificationResult.confidence * 100).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              {isLoaded ? (
                <StandaloneSearchBox
                  onLoad={onLoad}
                  onPlacesChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newReport.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    placeholder="Search for a location..."
                  />
                </StandaloneSearchBox>
              ) : (
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newReport.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  placeholder="Search for a location..."
                />
              )}
            </div>

            <div>
              <label
                htmlFor="waste-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Waste Type
              </label>
              <input
                type="text"
                id="wasteType"
                name="wasteType"
                value={newReport.wasteType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Type of waste (e.g. plastic, paper, etc.)"
                readOnly
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Amount
              </label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={newReport.amount}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Estimated amount (e.g. 2kg, 5 litres, etc.)"
                readOnly
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full eco-button-primary py-4 text-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                📤 Submitting...
              </>
            ) : (
              "✅ Submit Report & Earn Tokens"
            )}
          </Button>
        </form>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold eco-gradient-text mb-2">
            Recent Community Reports
          </h2>
          <p className="text-gray-600">
            See what others in your community are reporting
          </p>
        </div>
        <div className="eco-card overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 tracking-wider">
                    📍 Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 tracking-wider">
                    🗑️ Waste Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 tracking-wider">
                    ⚖️ Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 tracking-wider">
                    📅 Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-200">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-green-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      <MapPin className="inline-block w-4 h-4 mr-2 text-green-600" />
                      {report.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.wasteType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {report.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {report.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
