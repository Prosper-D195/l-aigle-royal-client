import React, { useEffect, useState } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la navigation et les commentaires
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Formulaire de commentaire
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CONFIGURATION DE L'URL API DYNAMIQUE ---
  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

  // 1. Chargement des notes techniques (Sécurisé sans cache)
  useEffect(() => {
    fetch(`${API_URL}/api/posts?_t=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        // Sécurité : Récupère le tableau qu'il soit direct ou encapsulé (ex: data.posts)
        const actualPosts = Array.isArray(data) ? data : (data.posts || data.data || []);
        setPosts(actualPosts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // 2. Chargement d'un rapport et de ses commentaires (Sécurisé sans cache)
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setLoadingComments(true);
    fetch(`${API_URL}/api/posts/${post.id}/comments?_t=${new Date().getTime()}`)
      .then((res) => res.json())
      .then((data) => {
        const actualComments = Array.isArray(data) ? data : (data.comments || data.data || []);
        setComments(actualComments);
        setLoadingComments(false);
      })
      .catch((err) => {
        console.error("Erreur commentaires:", err);
        setLoadingComments(false);
      });
  };

  // 3. Soumission d'un nouveau commentaire technique
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    fetch(`${API_URL}/api/posts/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    })
      .then((res) => res.json())
      .then((data) => {
        setComments([...comments, data]);
        setNewComment('');
        setIsSubmitting(false);
        setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, _count: { comments: (p._count?.comments || 0) + 1 } } : p));
      })
      .catch((err) => {
        console.error("Erreur lors de l'envoi du commentaire:", err);
        setIsSubmitting(false);
      });
  };

  // 4. Suppression d'un commentaire technique
  const handleDeleteComment = (commentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette observation technique ?")) return;

    fetch(`${API_URL}/api/comments/${commentId}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (res.ok) {
          setComments(comments.filter(c => c.id !== commentId));
          setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, _count: { comments: Math.max(0, (p._count?.comments || 1) - 1) } } : p));
        } else {
          console.error("Échec de la suppression sur le serveur");
        }
      })
      .catch((err) => console.error("Erreur lors de la suppression:", err));
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-[#1e293b] selection:bg-[#ea580c] selection:text-white flex flex-col justify-between scroll-smooth">
      <div>
        {/* 🏛️ HEADER & NAVIGATION */}
        <header className="border-b border-[#ea580c]/20 bg-[#f4f2ee]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedPost(null)}>
            <span className="text-2xl text-[#ea580c]">🦅</span>
            <span className="font-serif text-xl font-bold tracking-widest text-[#ea580c] uppercase">
              L'Aigle Royal
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-semibold tracking-wider uppercase text-[#475569]">
            <a href="#exploitation" onClick={() => setSelectedPost(null)} className="hover:text-[#ea580c] transition-colors">L'Exploitation</a>
            <a href="#suivi" onClick={() => setSelectedPost(null)} className="hover:text-[#ea580c] transition-colors">Notes de Culture</a>
          </nav>
        </header>

        {/* VUE DE DÉTAIL */}
        {selectedPost ? (
          <main className="max-w-4xl mx-auto px-6 py-16 animate-fadeIn">
            <button 
              onClick={() => setSelectedPost(null)}
              className="text-[#ea580c] text-sm font-semibold tracking-wide mb-8 flex items-center gap-2 hover:translate-x-[-4px] transition-transform bg-transparent border-none cursor-pointer"
            >
              ← Retour aux notes techniques
            </button>

            <article>
              <div className="border-b border-[#ea580c]/20 pb-6 mb-8">
                <span className="text-xs font-mono uppercase bg-[#ea580c]/10 text-[#c2410c] px-3 py-1.5 rounded mb-4 inline-block font-semibold">
                  {selectedPost.category}
                </span>
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#0f172a] leading-tight mb-4">
                  {selectedPost.title}
                </h1>
                <p className="text-sm text-[#64748b]">
                  Publié le {new Date(selectedPost.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* FICHE TECHNIQUE HORIZONTALE */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 bg-white border border-[#ea580c]/20 rounded-xl p-4 text-center shadow-sm">
                <div>
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Effectif</p>
                  <p className="font-serif text-lg font-bold text-[#ea580c]">1 250 Arbres</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Variété</p>
                  <p className="font-serif text-lg font-bold text-[#0f172a]">Calina IPB9</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Superficie</p>
                  <p className="font-serif text-lg font-bold text-[#0f172a]">0,5 Hectare</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Irrigation</p>
                  <p className="font-serif text-lg font-bold text-[#c2410c]">Goutte-à-goutte</p>
                </div>
              </div>

              <div className="text-[#334155] text-base md:text-lg leading-relaxed space-y-6 mb-16 whitespace-pre-line">
                <p>{selectedPost.content}</p>
              </div>
            </article>

            {/* 💬 ESPACE DE DISCUSSION */}
            <section className="pt-12 border-t border-[#ea580c]/20">
              <h2 className="font-serif text-2xl font-bold text-[#0f172a] mb-8 flex items-center gap-3">
                <span className="text-[#ea580c]">💬</span> Échanges & Suivi Agronomique
              </h2>

              {loadingComments ? (
                <div className="text-[#64748b] italic text-sm mb-6">Chargement des analyses...</div>
              ) : comments.length === 0 ? (
                <div className="bg-white border border-[#ea580c]/10 rounded-xl p-6 text-center text-[#64748b] italic text-sm mb-8 shadow-sm">
                  Aucune note complémentaire pour le moment.
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white border border-[#ea580c]/15 rounded-xl p-6 flex justify-between items-start gap-4 shadow-sm">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-[#ea580c]">Suivi Exploitation / Expert</span>
                          <span className="text-xs text-[#64748b]">
                            {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-[#334155] pl-4 border-l-2 border-[#ea580c]">{comment.content}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500/70 hover:text-red-600 text-xs font-mono bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors border border-red-200/40 cursor-pointer"
                        title="Supprimer la note"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULAIRE */}
              <form onSubmit={handleAddComment} className="bg-white border border-[#ea580c]/20 rounded-xl p-6 shadow-sm">
                <label htmlFor="comment" className="block text-sm font-semibold text-[#0f172a] mb-3">
                  Ajouter une observation ou une mesure technique :
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ex : Analyse de l'humidité après les pluies, ajustement du débit..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-3 text-sm text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#ea580c] resize-none mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Publication...' : 'Enregistrer l\'analyse'}
                </button>
              </form>
            </section>
          </main>
        ) : (
          /* VUE STANDARD (ACCUEIL) */
          <>
            {/* 🌅 HERO BANNER */}
            <section className="relative py-24 px-6 max-w-6xl mx-auto text-center border-b border-[#ea580c]/15">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 text-9xl opacity-5 pointer-events-none text-[#ea580c]">🦅</div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#c2410c] font-bold bg-[#ea580c]/10 px-4 py-1.5 rounded-full inline-block mb-4">
                Agrobusiness de Prestige
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#0f172a] max-w-3xl mx-auto leading-tight">
                Culture Spécialisée de Papayes <span className="text-[#ea580c] italic">Calina IPB9</span>
              </h1>
              <p className="mt-6 text-[#475569] max-w-xl mx-auto text-base md:text-lg font-normal leading-relaxed">
                Suivi de précision, rigueur agronomique et gestion connectée pour un verger d'élite.
              </p>
            </section>

            {/* 📊 CAHIER DE SUIVI */}
            <main id="suivi" className="max-w-6xl mx-auto px-6 py-16 border-b border-[#ea580c]/15">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#0f172a]">Cahier de Suivi Technique</h2>
                  <p className="text-sm text-[#ea580c] mt-1 font-medium">Analyses et mesures en direct des parcelles</p>
                </div>
                <span className="text-xs font-mono text-[#475569] bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
                  {posts.length} Note{posts.length > 1 ? 's' : ''} disponible(s)
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-[#64748b] italic">Chargement...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-[#64748b] italic">Aucune note publiée pour le moment.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {posts.map((post) => (
                    <article key={post.id} className="bg-white border border-[#ea580c]/10 rounded-xl p-6 hover:border-[#ea580c]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-mono uppercase bg-[#ea580c]/10 text-[#c2410c] px-2.5 py-1 rounded font-semibold">{post.category}</span>
                          <span className="text-xs text-[#64748b]">{new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#0f172a] group-hover:text-[#ea580c] transition-colors mb-3">{post.title}</h3>
                        <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">{post.content}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-[#64748b]">
                        <span className="font-medium text-slate-500">💬 {post._count?.comments || 0} commentaire{post._count?.comments > 1 ? 's' : ''}</span>
                        <button onClick={() => handleViewPost(post)} className="text-[#ea580c] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
                          Consulter le rapport →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </main>

            {/* 🌿 SECTION L'EXPLOITATION */}
            <section id="exploitation" className="max-w-6xl mx-auto px-6 py-24">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-xs font-mono text-[#ea580c] uppercase tracking-[0.25em] block font-bold">Vision & Excellence</span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0f172a] tracking-tight leading-tight">
                    Une infrastructure agricole <br/><span className="text-[#ea580c] italic">d'avant-garde</span>
                  </h2>
                  <p className="text-[#334155] text-base md:text-lg leading-relaxed font-normal">
                    L'exploitation de <strong>L'Aigle Royal</strong> allie le savoir-faire agronomique traditionnel aux outils numériques modernes pour maximiser le potentiel de notre verger de papayes.
                  </p>
                  <p className="text-[#475569] text-sm md:text-base leading-relaxed border-l-2 border-[#ea580c] pl-4 italic bg-[#ea580c]/5 py-2 rounded-r">
                    Grâce à un suivi pied par pied, une gestion optimisée des apports hydriques et un contrôle strict des facteurs environnementaux, nous assurons une production d'une qualité d'élite.
                  </p>
                </div>
                
                {/* Cartes d'identité */}
                <div className="lg:col-span-5 bg-white border border-[#ea580c]/15 rounded-2xl p-8 shadow-md relative overflow-hidden">
                  <h3 className="font-serif text-2xl font-bold text-[#0f172a] border-b border-slate-100 pb-4 mb-6 tracking-wide flex items-center gap-2">
                    <span className="text-[#ea580c]">📋</span> Fiche d'Identité Globale
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <span className="text-[#ea580c] mt-0.5">🌱</span>
                      <div>
                        <p className="text-xs text-[#64748b] uppercase font-mono tracking-wider">Projet Principal</p>
                        <p className="text-sm font-semibold text-[#0f172a]">Verger Technologique de Papayes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[#ea580c] mt-0.5">📐</span>
                      <div>
                        <p className="text-xs text-[#64748b] uppercase font-mono tracking-wider">Densité de plantation</p>
                        <p className="text-sm font-semibold text-[#0f172a]">1 250 Pieds Spécialisés (Calina IPB9)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[#ea580c] mt-0.5">💧</span>
                      <div>
                        <p className="text-xs text-[#64748b] uppercase font-mono tracking-wider">Gestion Hydrique</p>
                        <p className="text-sm font-bold text-[#c2410c] font-serif">Goutte-à-goutte Connecté Intégral</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[#ea580c] mt-0.5">🏆</span>
                      <div>
                        <p className="text-xs text-[#64748b] uppercase font-mono tracking-wider">Positionnement</p>
                        <p className="text-sm font-bold text-[#ea580c]">Agrobusiness d'Élite & de Haute Précision</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* 🏛️ FOOTER DE PRESTIGE */}
      <footer className="bg-[#0f172a] border-t border-slate-800 px-6 py-12 text-center sm:text-left text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl text-[#ea580c]">🦅</span>
            <span className="font-serif text-sm font-bold tracking-widest text-[#ea580c] uppercase">
              L'Aigle Royal
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 tracking-wide">
            © 2026 L'AIGLE ROYAL — Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs font-mono text-slate-400">
            <span className="text-slate-700">•</span>
            <span className="hover:text-[#ea580c] transition-colors">Système Connecté V1.0</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-[#ea580c] transition-colors">Exploitation Privée</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;