import { marked } from "marked";
import DOMPurify from "dompurify";

document.addEventListener('DOMContentLoaded', async () => {

    // --- Mobile Navigation Toggle ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-active');
            mobileNavToggle.classList.toggle('is-active');
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // --- Close mobile nav on link click ---
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
             if (mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active');
                mobileNavToggle.classList.remove('is-active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
             }
        });
    });

    // --- Header scroll effect ---
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Scroll-triggered Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // --- Animate stats on scroll ---
    const statsSection = document.getElementById('stats');
    const animateStat = (element, start, end, duration, suffix = '', prefix = '') => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let currentNum = Math.floor(progress * (end - start) + start);
            element.textContent = `${prefix}${currentNum.toLocaleString()}${suffix}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };









    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statItems = entry.target.querySelectorAll('.stat-item');
                
                // Animate numbers
                const stat1 = statItems[0].querySelector('.stat-number');
                const stat2 = statItems[1].querySelector('.stat-number');
                const stat3 = statItems[2].querySelector('.stat-number');

                // Special handling for 99.5%
                stat1.textContent = '0%';
                let current = 0;
                const target = 99.5;
                const interval = setInterval(() => {
                    current += 1;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    stat1.textContent = `${current.toFixed(1)}%`;
                }, 20);


                animateStat(stat2, 0, 50000, 2000, '+');
                
                // For <60s
                stat3.textContent = '<0s';
                let time = 0;
                const timeInterval = setInterval(() => {
                    time += 1;
                    if(time >= 60) {
                        time = 60;
                        clearInterval(timeInterval);
                    }
                    stat3.textContent = `<${time}s`;
                }, 30);


                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.5
    });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // --- AI Analysis Workflow ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const aiResultsContainer = document.getElementById('ai-results');
    const startOverBtn = document.getElementById('start-over-btn');

    const uploadStep = document.getElementById('upload-step');
    const analyzingStep = document.getElementById('analyzing-step');
    const resultsStep = document.getElementById('results-step');

    let uploadedFile = null;
    let uploadedFileUrl = null;

    function resetUploader() {
        uploadedFile = null;
        uploadedFileUrl = null;
        fileInput.value = ''; // Reset file input
        imagePreview.src = '#';
        imagePreviewContainer.style.display = 'none';
        dropZone.style.display = 'flex';
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyze Image';
        uploadStep.classList.add('active');
        analyzingStep.classList.remove('active');
        resultsStep.classList.remove('active');
        aiResultsContainer.innerHTML = '';
    }

    if(dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        removeImageBtn.addEventListener('click', () => {
            uploadedFile = null;
            uploadedFileUrl = null;
            fileInput.value = ''; 
            imagePreview.src = '#';
            imagePreviewContainer.style.display = 'none';
            dropZone.style.display = 'flex';
            analyzeBtn.disabled = true;
        });

        async function handleFile(file) {
            if (file && file.type.startsWith('image/')) {
                uploadedFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                    dropZone.style.display = 'none';
                    analyzeBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload a valid image file (PNG, JPG, WEBP).');
            }
        }

        analyzeBtn.addEventListener('click', async () => {
            if (!uploadedFile) return;

            uploadStep.classList.remove('active');
            analyzingStep.classList.add('active');
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
            
            try {
                // 1. Upload the file to get a URL
                const imageUrl = await window.websim.upload(uploadedFile);

                // 2. Call the AI with the image URL
                const completion = await websim.chat.completions.create({
                    messages: [{
                        role: "system",
                        content: `You are DR.AI, a specialized AI assistant for preliminary retinal scan screening. Analyze the provided retinal image for signs of common eye conditions. Your response MUST be in structured markdown format.

Provide the following sections:
- **Overall Assessment**: A one-sentence summary (e.g., "Signs consistent with early-stage Diabetic Retinopathy detected." or "No significant abnormalities detected.").
- **Condition Analysis**: A bulleted list for each of the following conditions: Diabetic Retinopathy, ARMD, Glaucoma, Cataracts. For each, state a confidence level (e.g., "Low confidence", "Moderate indication", "Strong signs") and a brief, easy-to-understand explanation of what you see (or don't see).
- **Recommendation**: Provide a clear recommendation. If signs are detected, strongly advise consulting an ophthalmologist. If no signs are detected, recommend regular check-ups.
- **Disclaimer**: ALWAYS include the following disclaimer: "This is an AI-powered screening and not a medical diagnosis. Consult a qualified healthcare professional for any health concerns."

Be professional, clear, and reassuring. Do not invent medical facts beyond visual interpretation of the image.`
                    }, {
                        role: "user",
                        content: [{
                            type: "image_url",
                            image_url: { url: imageUrl },
                        }, ],
                    }, ],
                });

                const resultsHtml = DOMPurify.sanitize(marked.parse(completion.content));
                aiResultsContainer.innerHTML = resultsHtml;
                
                analyzingStep.classList.remove('active');
                resultsStep.classList.add('active');

            } catch (error) {
                console.error('Analysis failed:', error);
                aiResultsContainer.innerHTML = `<p class="error">An error occurred during analysis. Please try again later.</p>`;
                analyzingStep.classList.remove('active');
                resultsStep.classList.add('active');
            }
        });
        
        startOverBtn.addEventListener('click', resetUploader);
    }
    








    // --- Choropleth Map Initialization ---
    const mapElement = document.getElementById('dr-map');
    const mapZoomToggleButton = document.getElementById('map-zoom-toggle');
    const diseaseSelector = document.getElementById('disease-selector');

    // use existing tooltip or create one
    let tooltipEl = document.getElementById('tooltip');
    if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'tooltip';
    Object.assign(tooltipEl.style, {
        position: 'absolute', display: 'none', pointerEvents: 'none',
        background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '6px 8px',
        borderRadius: '6px', fontSize: '12px', zIndex: 1000
    });
    document.body.appendChild(tooltipEl);
    }

    if (mapElement) {
    const mapObserver = new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
        initMap();
        observer.unobserve(mapElement);
        }
    }, { threshold: 0.1 });

    mapObserver.observe(mapElement);
    }

    async function initMap() {
    console.info('[INFO] initMap');
    const map = L.map('dr-map').setView([39.8283, -98.5795], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // zoom toggle
    if (mapZoomToggleButton) {
        let isZoomEnabled = true;
        mapZoomToggleButton.addEventListener('click', () => {
        (isZoomEnabled ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable());
        mapZoomToggleButton.textContent = isZoomEnabled ? 'Resume Map Zoom' : 'Pause Map Zoom';
        isZoomEnabled = !isZoomEnabled;
        });
    }

    // --- Files you asked for ---
    const files = {
        Glaucoma: 'glaucoma_map_data_hover_ready.geojson',
        Diabetic_Retinopathy: 'dr_map_data_hover_ready.geojson',
        ARMD: 'armd_map_data_hover_ready.geojson'
    };

    // --- Per-disease styling config (adjust bins if your data differs) ---
    const config = {
        Glaucoma: {
        property: 'Glaucoma_Prevalence',
        name: 'Glaucoma',
        colors: ['#c7e9c0', '#41ab5d', '#005a32'],
        bins: [1.2, 1.5, 2.0]
        },
        Diabetic_Retinopathy: {
        property: 'DR_Prevalence',        // change here if your key is different
        name: 'Diabetic Retinopathy',
        colors: ['#f2c9d7', '#e471ab', '#7a0177'],
        bins: [14.97, 23.11, 27.68]       // matches your earlier legend/screenshot
        },
        ARMD: {
        property: 'ARMD_Prevalence',
        name: 'ARMD',
        colors: ['#d0d1e6', '#74a9cf', '#0570b0'],
        bins: [9, 12, 15]
        }
    };

    let current = 'Glaucoma';
    let layer = null;
    let legend = null;
    const cache = new Map();

    const fetchGeo = async (filename) => {
        if (cache.has(filename)) return cache.get(filename);
        // If these files live in /public (Vite/Next/CRA), prefer fetch(`/${filename}`)
        const url = new URL(`./${filename}`, import.meta.url).href;
        console.info('[INFO] fetching', url);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${res.url}`);
        const json = await res.json();
        cache.set(filename, json);
        return json;
    };

    const getColorFor = (bins, colors, value) => (
        value > bins[2] ? colors[2] :
        value > bins[1] ? colors[1] :
        value > bins[0] ? colors[0] :
                        '#f7f7f7'
    );

    const createLegend = (cfg) => {
        if (legend) map.removeControl(legend);
        legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, ...cfg.bins];
        const labels = [`<strong>${cfg.name} (%)</strong>`];
        for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            const color = i === 0 ? '#f7f7f7' : cfg.colors[i - 1];
            labels.push(
            `<i style="background:${color}"></i> ${from}${to ? '&ndash;' + to : '+'}`
            );
        }
        div.innerHTML = labels.join('<br>');
        return div;
        };
        legend.addTo(map);
    };

    async function drawDisease(key) {
        const cfg = config[key];
        const file = files[key];
        if (!cfg) return console.error('[ERROR] Unknown disease key:', key);
        if (!file) return console.error('[ERROR] No file mapped for disease:', key);

        try {
        if (layer) map.removeLayer(layer);
        if (legend) map.removeControl(legend);

        const data = await fetchGeo(file);

        const style = (feature) => {
            const raw = feature.properties?.[cfg.property];
            const val = Number(raw);
            if (!Number.isFinite(val)) {
            console.warn(`[WARN] Missing/NaN ${cfg.property} for`, feature.properties?.NAME);
            }
            return {
            fillColor: getColorFor(cfg.bins, cfg.colors, val),
            weight: 0.5,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
            };
        };

        const onEachFeature = (feature, lyr) => {
            lyr.on({
            mouseover: (e) => {
                lyr.setStyle({ weight: 3, color: '#666', dashArray: '', fillOpacity: 0.7 });
                const p = feature.properties || {};
                const val = Number(p[cfg.property]);
                tooltipEl.innerHTML = `
                <strong>Location:</strong> ${p.STATE_NAME || p.STATE || 'Unknown'}<br>
                <strong>County:</strong> ${p.NAME || 'Unknown'}<br>
                <strong>${cfg.name}:</strong> ${Number.isFinite(val) ? val.toFixed(1) + '%' : 'N/A'}
                `;
                tooltipEl.style.display = 'block';
            },
            mousemove: (e) => {
                tooltipEl.style.left = `${e.originalEvent.pageX + 15}px`;
                tooltipEl.style.top  = `${e.originalEvent.pageY + 15}px`;
            },
            mouseout: () => {
                layer?.resetStyle(lyr);
                tooltipEl.style.display = 'none';
                tooltipEl.innerHTML = '';
            }
            });
        };

        layer = L.geoJson(data, { style, onEachFeature }).addTo(map);

        const b = layer.getBounds();
        if (b.isValid()) map.fitBounds(b, { padding: [20, 20], maxZoom: 8 });

        map.whenReady(() => map.invalidateSize());
        requestAnimationFrame(() => map.invalidateSize());

        createLegend(cfg);
        console.info('[INFO] rendered', key);
        } catch (err) {
        console.error('[ERROR] drawDisease failed:', err);
        document.getElementById('dr-map').innerHTML =
            '<p class="error">Could not load map data. Please try again later.</p>';
        }
    }

    // button group (event delegation)
    if (diseaseSelector) {
        diseaseSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.disease-btn');
        if (!btn) return;
        const key = btn.dataset.disease;
        if (!key) return;
        diseaseSelector.querySelectorAll('.disease-btn')
            .forEach(b => b.classList.toggle('active', b === btn));
        drawDisease(key);
        });
    }

    // initial render
    await drawDisease(current);
    }











    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                 question.setAttribute('aria-expanded', 'false');
                 answer.style.maxHeight = '0px';
            } else {
                 question.setAttribute('aria-expanded', 'true');
                 answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const thankYouMessage = document.getElementById('form-thank-you');
            contactForm.style.display = 'none';
            thankYouMessage.style.display = 'block';
        });
    }

    // --- Comments Section ---
    const commentsContainer = document.getElementById('comments-container');
    const loadMoreBtn = document.getElementById('load-more-comments');
    const commentsLoading = document.getElementById('comments-loading');
    const commentForm = document.getElementById('comment-form');
    const commentContent = document.getElementById('comment-content');
    const commentFormFeedback = document.getElementById('comment-form-feedback');

    let projectId = null;
    let commentsCursor = null;

    const renderComment = (commentData) => {
        const comment = commentData.comment;
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-card';
        commentEl.id = `comment-${comment.id}`;

        const commentHtml = DOMPurify.sanitize(marked.parse(comment.raw_content));

        let tipHtml = '';
        if (comment.card_data && comment.card_data.type === 'tip_comment') {
            tipHtml = `<div class="comment-tip">
                <i class="fas fa-coins"></i> Tipped ${comment.card_data.credits_spent} credits
            </div>`;
        }

        commentEl.innerHTML = `
            <div class="comment-header">
                <img src="${comment.author.avatar_url}" alt="${comment.author.username}'s avatar" class="comment-avatar">
                <div class="comment-author-info">
                    <span class="comment-author">${comment.author.username}</span>
                    <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                ${tipHtml}
            </div>
            <div class="comment-body">
                ${commentHtml}
            </div>
        `;
        return commentEl;
    };

    const loadComments = async (cursor = null) => {
        if (!projectId) return;
        commentsLoading.style.display = 'block';
        loadMoreBtn.style.display = 'none';

        try {
            const params = new URLSearchParams();
            if (cursor) {
                params.append('after', cursor);
            }
            const response = await fetch(`/api/v1/projects/${projectId}/comments?${params.toString()}`);
            const data = await response.json();

            if (data.comments && data.comments.data.length > 0) {
                data.comments.data.forEach(commentData => {
                    const commentEl = renderComment(commentData);
                    commentsContainer.appendChild(commentEl);
                });

                commentsCursor = data.comments.meta.end_cursor;
                if (data.comments.meta.has_next_page) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                    commentsCursor = null;
                }
            } else {
                 if (!cursor) { // Only show if it's the initial load
                    commentsContainer.innerHTML = '<p>No comments yet. Be the first to leave one!</p>';
                }
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
            commentsContainer.innerHTML = '<p class="error">Could not load comments. Please try again later.</p>';
        } finally {
            commentsLoading.style.display = 'none';
        }
    };

    if (commentsContainer) {
        // Initial load
        try {
            const project = await window.websim.getCurrentProject();
            projectId = project.id;
            loadComments();
        } catch(e) {
            console.error("Could not get project info");
            commentsLoading.style.display = 'none';
            commentsContainer.innerHTML = '<p class="error">Could not load comments for this project.</p>';
        }


        loadMoreBtn.addEventListener('click', () => {
            if (commentsCursor) {
                loadComments(commentsCursor);
            }
        });

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = commentContent.value.trim();
            if (!content) {
                commentFormFeedback.textContent = 'Comment cannot be empty.';
                commentFormFeedback.style.color = 'red';
                commentFormFeedback.style.display = 'block';
                return;
            }

            commentForm.querySelector('button').disabled = true;
            commentForm.querySelector('button').textContent = 'Posting...';

            try {
                await window.websim.postComment({ content });
                commentFormFeedback.textContent = 'Your comment has been submitted for posting!';
                commentFormFeedback.style.color = 'green';
                commentFormFeedback.style.display = 'block';
                commentContent.value = ''; // Clear textarea after successful pre-flight
            } catch (error) {
                console.error('Error posting comment:', error);
                commentFormFeedback.textContent = `Error: ${error.message || 'Could not post comment.'}`;
                commentFormFeedback.style.color = 'red';
                commentFormFeedback.style.display = 'block';
            } finally {
                 commentForm.querySelector('button').disabled = false;
                 commentForm.querySelector('button').textContent = 'Post Comment';
                 setTimeout(() => {
                    commentFormFeedback.style.display = 'none';
                 }, 4000);
            }
        });

        window.websim.addEventListener('comment:created', (data) => {
            console.log('New comment received:', data);
            // This could be improved to check for duplicates and insert at top
            const newCommentEl = renderComment(data);
            commentsContainer.prepend(newCommentEl);
             if(commentsContainer.querySelector('p')) {
                commentsContainer.querySelector('p').remove();
            }
        });
    }










});