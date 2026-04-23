/* ════════════════════════════════════════════════════════
   Annaprashan – Blessings Wall (Supabase Integration)
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // 👇 Yahan apna Supabase URL aur Anon Key daalein 👇
  const SUPABASE_URL = 'https://aayhohktelrwmunrmjub.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheWhvaGt0ZWxyd211bnJuanViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjQwNTQsImV4cCI6MjA5MjU0MDA1NH0.T3ZSUGd5EK7sTVOLSwf0jc3x5kwYTleFvTRDBW94UT8';

  let supabase = null;
  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // ─── PRE-LOADED BLESSINGS ─────────────────────────────
  const DEFAULT_BLESSINGS = [
    { id: 'def1', name: 'दादा-दादी', message: 'हमारी गुड़िया सदा खुश रहे, स्वस्थ रहे। ईश्वर की कृपा बनी रहे। 🙏', special: true },
    { id: 'def2', name: 'नाना-नानी', message: 'अर्विनंदा बेटी, तुम्हें बहुत प्यार। सदा मुस्कुराती रहो, दुनिया रोशन करो। 💕', special: true },
    { id: 'def3', name: 'Arthnanda Bhaiya', message: 'Meri Choti Bitti — tu duniya ki sabse pyaari hai! Main hamesha tere saath rahunga. 🤝', special: true },
  ];

  // ─── FETCH BLESSINGS FROM SUPABASE ────────────────────
  async function fetchBlessings() {
    if (!supabase) {
      console.warn("Supabase is not configured yet. Showing defaults.");
      return DEFAULT_BLESSINGS;
    }

    try {
      const { data, error } = await supabase
        .from('blessings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Merge defaults with cloud data
      return [...DEFAULT_BLESSINGS, ...data];
    } catch (e) {
      console.error('Error fetching blessings:', e);
      return DEFAULT_BLESSINGS;
    }
  }

  // ─── SAVE BLESSING TO SUPABASE ────────────────────────
  async function saveBlessing(name, message) {
    if (!supabase) {
      alert("Please configure Supabase URL and Key in js/blessings.js first!");
      return false;
    }

    try {
      const { error } = await supabase
        .from('blessings')
        .insert([{ name, message }]);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error saving blessing:', e);
      alert('Error saving blessing. Please try again.');
      return false;
    }
  }

  // ─── DELETE BLESSING ──────────────────────────────────
  window.deleteBlessing = async function (id) {
    if (!supabase) return;

    if (confirm("Kya aap sach me is aashirwad ko delete karna chahte hain?")) {
      try {
        const { error } = await supabase
          .from('blessings')
          .delete()
          .eq('id', id);

        if (error) throw error;
        renderDiyaWall(); // refresh UI
      } catch (e) {
        console.error('Error deleting:', e);
        alert('Error deleting blessing.');
      }
    }
  };

  // ─── EDIT BLESSING ────────────────────────────────────
  window.editBlessing = async function (id, currentName, currentMessage) {
    if (!supabase) return;

    const newName = prompt("Naam badlein (Edit Name):", currentName);
    if (newName === null) return; // Cancelled

    const newMessage = prompt("Aashirwad badlein (Edit Message):", currentMessage);
    if (newMessage === null) return; // Cancelled

    if (newName.trim() && newMessage.trim()) {
      try {
        const { error } = await supabase
          .from('blessings')
          .update({ name: newName.trim(), message: newMessage.trim() })
          .eq('id', id);

        if (error) throw error;
        renderDiyaWall(); // refresh UI
      } catch (e) {
        console.error('Error editing:', e);
        alert('Error editing blessing.');
      }
    }
  };

  // ─── RENDER DIYA WALL ─────────────────────────────────
  async function renderDiyaWall() {
    const wall = document.getElementById('diya-wall');
    if (!wall) return;

    wall.innerHTML = '<div style="width:100%; text-align:center; color:var(--deep-red);">Loading blessings...</div>';

    const blessings = await fetchBlessings();
    wall.innerHTML = '';

    blessings.forEach((b, idx) => {
      const diya = document.createElement('div');
      diya.className = 'blessing-diya' + (b.special ? ' special' : '');
      diya.style.animationDelay = `${(idx % 10) * 0.1}s`;

      const safeName = escapeHTML(b.name);
      const safeMessage = escapeHTML(b.message);

      let actionsHtml = '';
      // Only show Edit/Delete for non-default blessings
      if (!b.special && b.id) {
        actionsHtml = `
          <div class="diya-actions">
            <button class="diya-action-btn edit-btn" onclick="editBlessing('${b.id}', '${safeName.replace(/'/g, "\\'")}', '${safeMessage.replace(/'/g, "\\'")}')">✎ Edit</button>
            <button class="diya-action-btn delete-btn" onclick="deleteBlessing('${b.id}')">🗑 Remove</button>
          </div>
        `;
      }

      diya.innerHTML = `
        <div class="bd-flame-wrap">
          <div class="diya-flame"></div>
        </div>
        <div class="bd-base"></div>
        <div class="bd-name">${safeName}</div>
        <div class="bd-message">${safeMessage}</div>
        ${actionsHtml}
      `;

      wall.appendChild(diya);
    });

    // Update count
    const countEl = document.getElementById('blessing-count');
    if (countEl) countEl.textContent = blessings.length;
  }

  // ─── FORM SUBMISSION ─────────────────────────────────
  function initForm() {
    const form = document.getElementById('blessing-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('#bless-name');
      const msgInput = form.querySelector('#bless-message');
      const name = nameInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !message) return;

      const btn = form.querySelector('.bless-submit-btn');
      const originalText = btn.textContent;

      btn.textContent = '⏳ Bhej rahe hain...';
      btn.disabled = true;

      const success = await saveBlessing(name, message);

      if (success) {
        btn.textContent = '✅ Aashirwad mil gaya!';
        btn.style.background = '#4A7C59';

        // Clear form
        nameInput.value = '';
        msgInput.value = '';

        // Re-render wall
        await renderDiyaWall();
      } else {
        btn.textContent = '❌ Failed';
        btn.style.background = '#d9534f';
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 2500);
    });
  }

  // ─── SHARE FUNCTIONALITY ──────────────────────────────
  function initShare() {
    const shareBtn = document.getElementById('share-btn');
    const copyBtn = document.getElementById('copy-link-btn');

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const url = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/index.html');
        const text = '🌸 Arvinanda Maurya ka Annaprashan Sanskar! Aashirwad dijiye: ';

        if (navigator.share) {
          navigator.share({ title: 'Annaprashan — Arvinanda Maurya', text, url });
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const url = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/index.html');
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = '✅ Link Copied!';
          setTimeout(() => { copyBtn.textContent = '🔗 Copy Link'; }, 2000);
        });
      });
    }
  }

  // ─── ESCAPE HTML ──────────────────────────────────────
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── INIT ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderDiyaWall();
    initForm();
    initShare();
  });
})();
