(function () {
  function ensureBase() {
    if (window.__adminUiBase) {
      return window.__adminUiBase;
    }

    const toastHost = document.createElement('div');
    toastHost.className = 'fixed right-4 top-4 z-[120] flex flex-col gap-2';
    toastHost.style.cssText = 'width:min(92vw,360px);';
    document.body.appendChild(toastHost);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);padding:12px;';

    const panel = document.createElement('div');
    panel.style.cssText = 'width:min(94vw,40rem);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;padding:16px;box-shadow:0 24px 48px rgba(15,23,42,0.28);';

    const titleNode = document.createElement('h3');
    titleNode.style.cssText = 'font-size:1.05rem;font-weight:800;color:#0f172a;';

    const messageNode = document.createElement('p');
    messageNode.style.cssText = 'margin-top:10px;white-space:pre-wrap;font-size:0.92rem;line-height:1.5;color:#334155;overflow-y:auto;max-height:52vh;';

    const inputNode = document.createElement('textarea');
    inputNode.style.cssText = 'margin-top:10px;display:none;width:100%;border-radius:12px;border:1px solid #cbd5e1;padding:8px 10px;font-size:0.9rem;color:#0f172a;outline:none;';
    inputNode.rows = 4;

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'margin-top:12px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.style.cssText = 'border-radius:10px;border:1px solid #cbd5e1;background:#fff;padding:8px 14px;font-size:0.85rem;font-weight:600;color:#334155;cursor:pointer;';

    const okButton = document.createElement('button');
    okButton.type = 'button';
    okButton.style.cssText = 'border-radius:10px;border:none;background:#7e22ce;padding:8px 14px;font-size:0.85rem;font-weight:700;color:#fff;cursor:pointer;';

    buttonRow.appendChild(cancelButton);
    buttonRow.appendChild(okButton);

    panel.appendChild(titleNode);
    panel.appendChild(messageNode);
    panel.appendChild(inputNode);
    panel.appendChild(buttonRow);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    let resolver = null;

    function closeDialog(result) {
      overlay.style.display = 'none';
      const pending = resolver;
      resolver = null;
      if (pending) pending(result);
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay && resolver) {
        closeDialog(null);
      }
    });

    function toast(message, type = 'info') {
      const colorMap = {
        info: 'border-slate-200 bg-white text-slate-800',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        error: 'border-rose-200 bg-rose-50 text-rose-800',
      };

      const item = document.createElement('div');
      item.className = `rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${colorMap[type] || colorMap.info}`;
      item.textContent = String(message || '');
      toastHost.appendChild(item);

      setTimeout(() => {
        item.classList.add('opacity-0', 'transition');
        setTimeout(() => item.remove(), 240);
      }, 2200);
    }

    async function dialog(options) {
      if (resolver) {
        closeDialog(null);
      }

      const {
        title,
        message,
        mode = 'alert',
        confirmText = 'OK',
        cancelText = 'Cancel',
        defaultValue = '',
        placeholder = '',
      } = options || {};

      titleNode.textContent = String(title || 'Message');
      messageNode.textContent = String(message || '');

      const useInput = mode === 'prompt';
      const showCancel = mode === 'confirm' || mode === 'prompt';

      inputNode.style.display = useInput ? 'block' : 'none';
      inputNode.value = useInput ? String(defaultValue || '') : '';
      inputNode.placeholder = useInput ? String(placeholder || '') : '';

      cancelButton.style.display = showCancel ? 'inline-block' : 'none';
      cancelButton.textContent = String(cancelText || 'Cancel');
      okButton.textContent = String(confirmText || 'OK');

      overlay.style.display = 'flex';

      if (useInput) {
        setTimeout(() => inputNode.focus(), 0);
      } else {
        setTimeout(() => okButton.focus(), 0);
      }

      return await new Promise((resolve) => {
        resolver = resolve;

        cancelButton.onclick = () => closeDialog(null);
        okButton.onclick = () => {
          if (useInput) {
            closeDialog(inputNode.value);
          } else if (mode === 'confirm') {
            closeDialog(true);
          } else {
            closeDialog(true);
          }
        };
      });
    }

    window.__adminUiBase = {
      toast,
      dialog,
    };

    return window.__adminUiBase;
  }

  function labelsFor(locale) {
    if (locale === 'en') {
      return {
        messageTitle: 'Message',
        detailsTitle: 'Details',
        confirmTitle: 'Please Confirm',
        promptTitle: 'Input Required',
        ok: 'OK',
        cancel: 'Cancel',
      };
    }

    return {
      messageTitle: 'Bilgi',
      detailsTitle: 'Detay',
      confirmTitle: 'Lutfen Onaylayin',
      promptTitle: 'Girdi Gerekli',
      ok: 'Tamam',
      cancel: 'Iptal',
    };
  }

  window.AdminUi = {
    create(options) {
      const locale = options?.locale === 'en' ? 'en' : 'tr';
      const labels = labelsFor(locale);
      const base = ensureBase();

      return {
        toast(message, type) {
          base.toast(message, type);
        },

        async alert(message, title) {
          await base.dialog({
            mode: 'alert',
            title: title || labels.messageTitle,
            message,
            confirmText: labels.ok,
          });
        },

        async details(message, title) {
          await base.dialog({
            mode: 'alert',
            title: title || labels.detailsTitle,
            message,
            confirmText: labels.ok,
          });
        },

        async confirm(message, title, confirmText, cancelText) {
          const result = await base.dialog({
            mode: 'confirm',
            title: title || labels.confirmTitle,
            message,
            confirmText: confirmText || labels.ok,
            cancelText: cancelText || labels.cancel,
          });
          return Boolean(result);
        },

        async prompt(message, title, placeholder, defaultValue, confirmText, cancelText) {
          const result = await base.dialog({
            mode: 'prompt',
            title: title || labels.promptTitle,
            message,
            placeholder,
            defaultValue,
            confirmText: confirmText || labels.ok,
            cancelText: cancelText || labels.cancel,
          });
          return result === null ? null : String(result);
        },
      };
    },
  };
})();
