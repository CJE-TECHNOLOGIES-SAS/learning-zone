// src/shared/ui/confirmDialog.ts

import type { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";
import Swal from "sweetalert2";

import './styles/WindowModalDelete.css'
/** Variantes de color para el botón de confirmar */
export type ConfirmVariant = "danger" | "primary" | "success" | "warning" | "neutral";

type ConfirmDialogArgs = {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
  /** Cambia el color del botón de confirmar */
  variant?: ConfirmVariant;
  /** Sobrescribe cualquier opción de Swal si lo necesitas */
  swOptions?: SweetAlertOptions;
};

/**
 * confirmDialog: wrapper reusable para SweetAlert2 con estilos propios.
 * Devuelve true si el usuario confirma; false si cancela/cierra.
 */
export async function windowModalDelete({
  title,
  text = "",
  icon = "warning",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  swOptions = {},
}: ConfirmDialogArgs): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,

    // Clases custom (coinciden con el CSS de abajo)
    customClass: {
      popup: "educational-confirm-popup",
      title: "educational-confirm-title",
      htmlContainer: "educational-confirm-content",
      confirmButton: `educational-confirm-btn educational-confirm-${variant}`,
      cancelButton: "educational-confirm-btn educational-confirm-cancel",
    },




    // Necesario para que respeten nuestras clases
    buttonsStyling: false,

    // Accesibilidad/UX
    timer: swOptions.timer ?? undefined,
    timerProgressBar: swOptions.timer ? true : false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    stopKeydownPropagation: false,

    ...swOptions,
  });

  return !!result.isConfirmed;
}
