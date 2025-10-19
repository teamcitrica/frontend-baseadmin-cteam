"use client";

import { Container, Col } from "@citrica/objects";
import React, { useRef, useEffect } from "react";
import { Modal as HeroModal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import Icon from "../atoms/icon";
import Text from "../atoms/text";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  placement?: "center" | "top" | "bottom" | "top-center" | "bottom-center";
  backdrop?: "transparent" | "opaque" | "blur";
  scrollBehavior?: "normal" | "inside" | "outside";
  hideCloseButton?: boolean;
  isDismissable?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = ({ 
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  placement = "center",
  backdrop = "opaque",
  scrollBehavior = "normal",
  hideCloseButton = false,
  isDismissable = true,
  className,
  header,
  footer
}: ModalProps) => {

  // Handle ESC key press for accessibility
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDismissable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Lock body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, isDismissable]);

  return (
    <HeroModal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      placement={placement}
      backdrop={backdrop}
      scrollBehavior={scrollBehavior}
      hideCloseButton={hideCloseButton}
      isDismissable={isDismissable}
      className={className}
    >
      <ModalContent>
        {header || title ? (
          <ModalHeader className="flex flex-col gap-1">
            {header || (title && <Text variant="headline">{title}</Text>)}
          </ModalHeader>
        ) : null}
        
        <ModalBody>
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </HeroModal>
  );
};

// Legacy Modal component for backward compatibility
interface LegacyModalProps {
  imageUrl?: string | null;
  title?: string | null;
  description?: string | null;
  url2?: string | null;
  price?: string | null;
  onClose: () => void;
}

const LegacyModal = ({ imageUrl, title, description, url2, onClose, price }: LegacyModalProps) => {
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="modal-bg flex-col items-center modal-open">
      <button 
        className="fixed top-3 right-3 flex justify-end w-full z-50" 
        onClick={onClose}
        aria-label="Cerrar modal"
      >
        <Icon name="X" size={40} className="text-white" />
      </button>

      <div className="modal-content p-16 gap-10 box-border" ref={modalContentRef} role="dialog" aria-modal="true">
        <Container>
          <Col cols={{lg:6, md:3, sm:4}}>
            {imageUrl && (
              <div className="flex justify-center items-center">
                <img className="w-[400px] rounded-2xl" src={imageUrl} alt={title || "Imagen del modal"} />
              </div>
            )}
          </Col>
          <Col cols={{lg:6, md:3, sm:4}}>
            <div className="modal-content-second">
              <div className="modal-content-tex">
                {title && (
                  <h2 className="modal-title">{title}</h2>
                )}
                {description && (
                  <p className="modal-description">{description}</p>
                )}
                {price && !isNaN(parseFloat(price)) && (
                  <p className="text-default-500">{`$${parseFloat(price).toFixed(2)}`}</p>
                )}
              </div>
              <div className="modal-content-second-img">
                {url2 && (
                  <picture className="flex-[2]">
                    <img src={url2} alt={`${title} - imagen adicional` || "Imagen adicional"} />
                  </picture>
                )}
              </div>
            </div>
          </Col>
        </Container>
      </div>
    </div>
  );
};

export default Modal;
export { LegacyModal };
export type { ModalProps, LegacyModalProps };
