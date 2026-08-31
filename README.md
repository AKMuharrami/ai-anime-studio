# AI Manga Studio

An advanced, foul-proof AI manga creation platform that guarantees absolute character continuity and aesthetic lock across generated comic panels.

## 🧠 The Continuity Architecture (Foul-Proof Pipeline)

This platform solves the most notorious issue in AI comic generation—character hallucination and visual drift—through a **Reference-Conditioned Composition Pipeline**.

### 1. Dual-Asset Stage Isolation
Instead of relying on a single prompt to render characters and environments together, this application structurally separates them:
- **Master Backdrops**: Environments are generated independently to establish grid perspective, lighting, and stage geometry.
- **Master Turnarounds**: High-fidelity character sheets (front, side, back) are generated to lock down clothing, facial geometry, and accessories.

### 2. Multi-Reference Inpainting Payload
When a panel is requested, the system compiles a highly structured composition payload for the diffusion model (`qwen-image-2-pro`):
- `source_image_url`: The pre-rendered environment backdrop ensures the spatial layout remains identical.
- `mask_url` / `reference_images`: The character turnaround sheet is injected directly into the cross-attention layers of the model.
- **Fail-Safe Fallbacks**: If reference constraints clash or the primary request is rejected by the API due to strict validation schemas, the application automatically retries with a highly descriptive text-only payload that explicitly describes the character and environment using physical features derived from your Vault.

### 3. Absolute Aesthetic Lock
A global style mandate is hardcoded into the render engine:
`"Pure black and white ink lineart with clean halftone screentones, deep spatial depth, cinematic heavy ink shadows."`
This physically prevents the model from injecting unwanted colors, gradients, or 3D renders into your panels, forcing a consistent Gekiga manga aesthetic.

## 🛠️ API & Schema Handling
The engine handles specific schema requirements dynamically:
- Certain models (like `qwen-image-2-pro` via specific API relays) reject generic parameters such as `aspect_ratio` and `seed` at the root object level.
- The pipeline scrubs invalid parameters from the payload to prevent `400 Validation failed` errors while still maintaining high-fidelity output through precise prompt conditioning.

## 🚀 Getting Started

1. Set up your **Firebase / PostgreSQL** Vault to store persistent character and location descriptors.
2. In **Step 1**, write out your script and let the system parse characters and locations.
3. In **Step 2**, use the Smart Continuity Scanner to autofill and generate your Master Turnarounds and Stage Layouts.
4. In **Step 3**, generate final panels. The system will automatically inject your Vault references into the final render requests.
