// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const headers        = document.querySelectorAll('.accordion-header');
  const searchInput    = document.getElementById('searchInput');
  const expandAllBtn   = document.getElementById('expandAll');
  const collapseAllBtn = document.getElementById('collapseAll');
  const themeToggle    = document.getElementById('themeToggle');
  const controls       = document.querySelector('.toolbar-controls');
  const noResults      = document.getElementById('noResults');

  // ——— Search / Filter ———
  function updateDisplayForSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let matched = 0;

    document.querySelectorAll('.accordion-item').forEach(item => {
      const header = item.querySelector('.accordion-header');
      const body   = header.nextElementSibling;
      const text   = header.textContent.trim().toLowerCase();

      if (query) {
        if (text.includes(query)) {
          item.style.display = 'block';
          header.classList.remove('active');
          body.style.maxHeight = null;
          matched++;
        } else {
          item.style.display = 'none';
        }
      } else {
        item.style.display = 'block';
        header.classList.remove('active');
        body.style.maxHeight = null;
      }
    });

    controls.style.display  = query ? 'none' : 'flex';
    noResults.style.display = (query && matched === 0) ? 'block' : 'none';
  }

  searchInput.addEventListener('input', updateDisplayForSearch);

  // ——— Accordion Toggle ———
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (item.style.display === 'none') return;

      header.classList.toggle('active');
      const body = header.nextElementSibling;
      if (header.classList.contains('active')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = null;
      }
    });
  });

  // ——— Expand All ———
  expandAllBtn.addEventListener('click', () => {
    headers.forEach(header => {
      const item = header.closest('.accordion-item');
      if (item.style.display === 'none') return;
      header.classList.add('active');
      header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + 'px';
    });
  });

  // ——— Collapse All ———
  collapseAllBtn.addEventListener('click', () => {
    headers.forEach(header => {
      header.classList.remove('active');
      header.nextElementSibling.style.maxHeight = null;
    });
  });

  // ——— Dark Mode Toggle ———
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
  });

  // ——— jsPDF Setup ———
  const jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
  if (!jsPDF) console.warn('jsPDF not loaded; PDF download disabled.');

  // ——— Download PDF Handler ———
  if (jsPDF) {
    document.querySelectorAll('.download-icon').forEach(icon => {
      icon.addEventListener('click', e => {
        e.stopPropagation(); // prevent accordion toggle

        const header = icon.closest('.accordion-header');
        const title  = header.firstChild.textContent.trim();
        const items  = Array.from(header.nextElementSibling.querySelectorAll('li'))
          .map(li => li.textContent.trim());

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${title} Checklist`, 10, 20);
        doc.setFontSize(12);
        items.forEach((line, i) => {
          doc.text(`- ${line}`, 10, 30 + i * 8);
        });
        doc.save(`${title}.pdf`);
      });
    });
  }

  // ——— Share Handler (Native share / WhatsApp fallback) ———
  document.querySelectorAll('.share-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();

      const header = icon.closest('.accordion-header');
      const title  = header.firstChild.textContent.trim();
      const items  = Array.from(header.nextElementSibling.querySelectorAll('li'))
        .map(li => `- ${li.textContent.trim()}`)
        .join('\n');
      const message = `📋 ${title} Checklist:\n${items}\n\n🔗 ${window.location.href}`;

      if (navigator.share) {
        navigator.share({ title: `${title} Checklist`, text: message });
      } else {
        window.open(
          'https://wa.me/?text=' + encodeURIComponent(message),
          '_blank'
        );
      }
    });
  });
});
// Download icon functionality
document.querySelectorAll('.download-icon').forEach(icon => {
  icon.addEventListener('click', async (event) => {
    event.stopPropagation(); // stop header toggle
    const body = icon.closest('.accordion-item').querySelector('.accordion-body');
    const title = icon.closest('.accordion-item').querySelector('.accordion-header').innerText.trim();
    const content = body.innerText.trim();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 10, 10);
    doc.setFontSize(12);
    doc.text(content, 10, 20);
    doc.save(`${title.replace(/\s+/g, '_')}_Checklist.pdf`);
  });
});

// Share icon functionality
document.querySelectorAll('.share-icon').forEach(icon => {
  icon.addEventListener('click', async (event) => {
    event.stopPropagation(); // stop header toggle
    const body = icon.closest('.accordion-item').querySelector('.accordion-body');
    const title = icon.closest('.accordion-item').querySelector('.accordion-header').innerText.trim();
    const content = body.innerText.trim();

    const message = `${title} Checklist:\n${content}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} Checklist`,
          text: message
        });
      } catch (error) {
        alert("Sharing cancelled or failed.");
      }
    } else {
      // Fallback: WhatsApp
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  });
});

