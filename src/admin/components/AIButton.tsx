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

interface AIButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const AIButton: React.FC = () => {
  const { model } = useContentManagerContext();
  console.log({ model });
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const enhancedPrompt = async (prompt: string) => {
    setIsLoading(true);
    try {
      console.log({ prompt });

      const data = {
        prompt: prompt,
      };
      const generateUpdatedPrompt = await axios.post(
        "/api/blog/enhance-prompt",
        data
      );
      console.log({generateUpdatedPrompt:generateUpdatedPrompt?.data});
      
      const extractMessage =generateUpdatedPrompt?.data;
      console.log({extractMessage});
      
      if (!extractMessage) {
        setError(generateUpdatedPrompt.data);
        return;
      }

      // setPrompt(JSON.parse(generateUpdatedPrompt.data?.data)?.message);
    } catch (error: any) {
      setError(error?.message);
      setTimeout(() => {
        setError('');
      }, 5000);
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (model !== "api::blog.blog") return null;
  return (
    <>
      <Modal.Root>
        <Modal.Trigger>
          <Button startIcon={<Alien />} >
            Create with AI
          </Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Generate AI Blog Content</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Field.Root style={{ position: "relative" }} name="name" required>
              <Field.Label>Enter Your Prompt Here</Field.Label>
              <Textarea
                placeholder="Enter a detailed prompt to generate blog content (e.g., 'Write an article about AI trends in 2024')"
                name="content"
                value={prompt}
                required
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />

              {isLoading ? (
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
                  disabled={isLoading}
                >
                  <Magic height={20} width={20} />
                </IconButton>
              )}
            </Field.Root>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary">Cancel</Button>
            </Modal.Close>
            <Button>Confirm</Button>
          </Modal.Footer>
          {error && (
        <Alert style={{position:'fixed',top:'5px',right:'5px'}} closeLabel="Close" title="Error" variant="danger">
          {error}
        </Alert>
      )}
        </Modal.Content>
      </Modal.Root>
     
    </>
  );
};

export default AIButton;
