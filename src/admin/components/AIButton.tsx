import {
  Alert,
  Button,
  Field,
  IconButton,
  Textarea,
} from "@strapi/design-system";
import React, { useState } from "react";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import { Modal } from "@strapi/design-system";
import { Alien, Loader, Magic } from "@strapi/icons";
import axios from "axios";
import "/public/index.css";

interface AIButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const AIButton: React.FC = () => {
  const { model } = useContentManagerContext();
  console.log({ model });
  const [prompt, setPrompt] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const enhancedPrompt = async (prompt: string) => {
    setIsEnhancing(true);
    try {
      console.log({ prompt });

      const data = {
        prompt: prompt,
      };
      const generateUpdatedPrompt = await axios.post(
        "/api/blogs/enhance-prompt",
        data
      );
      console.log({ generateUpdatedPrompt: generateUpdatedPrompt?.data });

      const extractMessage = generateUpdatedPrompt?.data?.data;
      console.log({ extractMessage });

      setPrompt(extractMessage);

      if (!extractMessage) {
        setError(generateUpdatedPrompt.data);
        return;
      }
    } catch (error: any) {
      setError(error?.message);
      setTimeout(() => {
        setError("");
      }, 5000);
      throw new Error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateBlog = async () => {
    try {
      setIsGenerating(true);
      const data = {
        prompt: prompt,
      };
      const response = await axios.post("/api/blogs/generate", data);
      if (response.data) {
        console.log("Generated blog:", response.data?.data);
        setSuccess("Blog Created Successfully");
        setTimeout(() => {
          setSuccess("");
          setIsOpen(false);
        }, 3000);
        console.log({ response: response?.data?.data });

        if (response?.data?.data?.documentId) {
          window.location.href = `/admin/content-manager/collection-types/api::blog.blog/${response?.data?.data?.documentId}`;
          return;
        }
        setError("Failed to Generate Blog");

        // window.location.reload();
      } else {
        setError("Failed to Generate Blog");
      }
    } catch (error: any) {
      setError(error?.message || "An error occurred");
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  if (model !== "api::blog.blog") return null;
  return (
    <>
      <Modal.Root
        open={isOpen}
        defaultOpen={false}
        onOpenChange={() => setIsOpen(!isOpen)}
      >
        <Modal.Trigger onClick={() => setIsOpen(true)}>
          <Button startIcon={<Alien />}>Create with AI</Button>
        </Modal.Trigger>
        <Modal.Content style={{ height: "500px" }}>
          <Modal.Header>
            <Modal.Title>Generate AI Blog Content</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Field.Root style={{ position: "relative" }} name="name" required>
              <Field.Label>Enter Your Prompt Here</Field.Label>

              <div 
                style={{ 
                  height: "25.5rem",
                  outline: "none",
                  boxShadow: "none",
                  transitionProperty: "border-color, box-shadow, fill",
                  transitionDuration: "0.2s",
                  borderRadius: "4px",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--background-color)"
                }}
              >
                <textarea
                  placeholder="Enter a detailed prompt to generate blog content (e.g., 'Write an article about AI trends in 2024')"
                  name="content"
                  value={prompt}
                  required
                  style={{ 
                    height: "100%",
                    width: "100%",
                    padding: "8px",
                    resize: "none",
                    minHeight: "150px",
                    outline: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-color)",
                    border: "none",
                    fontSize: "16px",
                    lineHeight: "1.5"
                  }}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isEnhancing || isGenerating}
                />
              </div>

              {isEnhancing ? (
                <Loader
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "20px",
                  }}
                />
              ) : (
                <IconButton
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "20px",
                    border: "none",
                    opacity: 0.5,
                  }}
                  onClick={() => enhancedPrompt(prompt)}
                  label="Enhance Prompt"
                  disabled={isEnhancing || prompt.length <= 10}
                >
                  <Magic height={20} width={20} />
                </IconButton>
              )}
            </Field.Root>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </Modal.Close>
            <Button
              onClick={generateBlog}
              disabled={isGenerating || prompt.length < 50}
            >
              {isGenerating ? "Generating..." : "Confirm"}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {error && (
        <Alert
          style={{ position: "fixed", top: "5px", right: "5px" }}
          closeLabel="Close"
          title="Error"
          variant="danger"
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          style={{ position: "fixed", top: "5px", right: "5px" }}
          closeLabel="Close"
          title="Success"
          variant="success"
        >
          {success}
        </Alert>
      )}
    </>
  );
};

export default AIButton;
