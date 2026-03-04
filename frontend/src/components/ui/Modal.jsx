import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) => {
  const modalRef = useRef(null)
  const previousFocus = useRef(null)

  // Sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]'
  }

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Save previous focus
      previousFocus.current = document.activeElement
      // Focus modal
      setTimeout(() => modalRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      // Restore focus
      if (previousFocus.current) {
        previousFocus.current.focus()
      }
    }
  }, [isOpen, closeOnEsc, onClose])

  // Handle click outside
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${overlayClassName}`}
      onClick={handleClickOutside}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizes[size]} bg-white dark:bg-gray-800 rounded-xl shadow-2xl
          transform transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 overflow-y-auto ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Confirmation Modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
      {...props}
    >
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </Modal>
  )
}

// Form Modal
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      }
      {...props}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  )
}

// Drawer Modal (slides from side)
export const DrawerModal = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  ...props
}) => {
  const positions = {
    left: 'left-0 top-0 h-full translate-x-0 -translate-x-full',
    right: 'right-0 top-0 h-full translate-x-0 translate-x-full',
    top: 'top-0 left-0 w-full translate-y-0 -translate-y-full',
    bottom: 'bottom-0 left-0 w-full translate-y-0 translate-y-full'
  }

  const sizes = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    xl: position === 'left' || position === 'right' ? 'w-[48rem]' : 'h-[48rem]',
    full: position === 'left' || position === 'right' ? 'w-screen' : 'h-screen'
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`
          fixed bg-white dark:bg-gray-800 shadow-2xl
          transform transition-transform duration-300
          ${positions[position]}
          ${sizes[size]}
          ${isOpen ? 'translate-x-0 translate-y-0' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-full overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal