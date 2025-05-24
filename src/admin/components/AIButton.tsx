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
        "/api/blog/enhance-prompt",
        data
      );
      console.log({generateUpdatedPrompt:generateUpdatedPrompt?.data});
      
      const extractMessage =generateUpdatedPrompt?.data?.data;
      console.log({extractMessage});

      setPrompt(extractMessage);
      
      if (!extractMessage) {
        setError(generateUpdatedPrompt.data);
        return;
      }
    } catch (error: any) {
      setError(error?.message);
      setTimeout(() => {
        setError('');
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
        prompt: prompt
      };
      const response = await axios.post('/api/blog/generate', data);
      if (response.data) {
        console.log('Generated blog:', response.data?.data);
        setSuccess('Blog Created Successfully');
        setTimeout(() => {
          setSuccess('');
          setIsOpen(false);
        }, 3000);

        window.location.reload();
      } else {
        setError('Failed to generate blog');
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred');
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  }

  if (model !== "api::blog.blog") return null;
  return (
    <>
      <Modal.Root open={isOpen} defaultOpen={false}  onOpenChange={()=>setIsOpen(!isOpen)}>
        <Modal.Trigger onClick={() => setIsOpen(true)}>
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
                disabled={isEnhancing || isGenerating}
              />

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
              <Button variant="tertiary" onClick={() => setIsOpen(false)}>Cancel</Button>
            </Modal.Close>
            <Button 
              onClick={generateBlog}
              disabled={isGenerating || prompt.length < 50}
            >
              {isGenerating ? 'Generating...' : 'Confirm'}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {error && (
        <Alert style={{position:'fixed',top:'5px',right:'5px'}} closeLabel="Close" title="Error" variant="danger">
          {error}
        </Alert>
      )}
      {success && (
        <Alert style={{position:'fixed',top:'5px',right:'5px'}} closeLabel="Close" title="Success" variant="success">
          {success}
        </Alert>
      )}
    </>
  );
};

export default AIButton;
