# SarthiChatBot — Retrieval-Augmented Generation (RAG) Module

## Purpose

This directory contains the **Retrieval-Augmented Generation (RAG) implementation** used by **SarthiChatBot**, the official AI assistant for the Hirekruit platform.

The goal of this module is to enable SarthiChatBot to answer **Hirekruit-specific queries** in a controlled and reliable manner by retrieving information from approved internal documentation instead of relying on model memory or external knowledge.

This is a **sub-module**, not a standalone application, and is intended to be integrated into the main backend service where LLM inference is handled.

---

## Why RAG Was Required

Hirekruit’s product knowledge includes multiple structured documents covering:

* Recruitment drive workflows
* Candidate pipelines
* AI interview functionality
* Analytics and dashboards
* Governance, identity, and scope rules

Embedding this information directly into prompts or allowing the model to answer freely introduces risks such as hallucination, outdated responses, and scope violations.

The RAG approach implemented here ensures that:

* All answers are grounded in internal documentation
* Documentation can be updated without retraining models
* System-level rules are always enforced
* The assistant remains strictly domain-locked to Hirekruit

---

## Design Overview

The RAG system is designed around **clear separation of concerns**:

1. **Knowledge ingestion**
2. **Semantic retrieval**
3. **Governed context construction**

No response is generated without first assembling an authoritative context.

---

## Knowledge Classification

Documentation is intentionally divided into two categories.

### 1. Static Knowledge (Governance & Scope)

Static documents define **non-negotiable rules**, such as:

* Assistant identity
* Allowed and disallowed topics
* Security and governance constraints

These documents:

* Are stored as plain text (not embedded)
* Are injected into every query context
* Ensure consistent behavior regardless of query content

This prevents scope leakage and prompt manipulation.

---

### 2. Dynamic Knowledge (Operational Content)

Dynamic documents describe **Hirekruit platform features and workflows**, such as:

* Drive creation
* Dashboard navigation
* Analytics pipeline
* AI interview operations

These documents:

* Are embedded using SentenceTransformers
* Are stored in MongoDB Atlas Vector Search
* Are retrieved dynamically based on query relevance

Only the most relevant documents are included per query.

---

## Ingestion Pipeline

The ingestion process is implemented in `ingest.py` and follows a controlled workflow:

1. Markdown files are loaded from the `docs/` directory
2. Documents are classified as static or dynamic
3. Static documents are stored as plain text
4. Dynamic documents are embedded and stored in the vector collection

### Key Design Decisions

* Static documents are refreshed on every ingestion run
* Dynamic documents are ingested only once to prevent duplication
* Each document is embedded as a single semantic unit

---

## No-Chunking Rationale

Chunking is intentionally not used in this implementation.

Hirekruit documentation is authored as **atomic semantic units**, where each file represents a complete workflow or feature. Embedding full documents improves:

* Traceability of responses
* Auditability during reviews
* Alignment between retrieved context and official documentation

This tradeoff favors governance clarity over marginal recall gains.

---

## Query-Time Retrieval Flow

For each user query:

1. **Static Context Loading**

   * All governance and scope documents are loaded
   * Ensures rules are always enforced

2. **Dynamic Context Retrieval**

   * Query is embedded
   * Top-K relevant documents are retrieved using vector search

3. **Context Assembly**

   * Static and dynamic content are combined into a governed system prompt
   * No external or inferred knowledge is added

This assembled context is then passed to the LLM by the parent service.

---

## Technology Stack

* **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`)
* **Vector Store**: MongoDB Atlas Vector Search
* **Database**: MongoDB Atlas
* **Backend Language**: Python
* **Orchestration**: LangChain (retrieval only)
* **LLM**: Handled by the parent chatbot service

---

## Non-Goals

This RAG module is intentionally **not designed** to:

* Answer general knowledge questions
* Provide career, legal, or HR advice outside Hirekruit workflows
* Learn from or adapt to user conversations
* Generate speculative or inferred information

---

## Directory Scope

This directory represents **only the RAG layer** of SarthiChatBot.

```
SarthiRag/
├── docs/                  # Source Hirekruit documentation
├── ingest.py              # Knowledge ingestion logic
├── rag.py                 # Retrieval and context assembly
├── config/
│   └── mongodb.py         # MongoDB connection handling
├── embeddings/
│   └── sentence_transformer.py
```

---

## Sample Queries and Responses

The following examples demonstrate how SarthiChatBot retrieves information from internal documentation and produces grounded responses.

---

### How do I create a recruitment drive?

**Documents Used**

* identity_and_governance.md
* conduct_and_scope.md
* dashboard_navigation.md
* analytics_pipeline.md
* drive_creation.md

**Response**

To create a new recruitment drive in Hirekruit, follow these steps:

1. Navigate to the Drive Creation section from the Hirekruit dashboard
2. Enter job identity details such as Job ID, role, headcount, and job type
3. Define candidate requirements, including experience tier and skills
4. Configure assessment rounds (resume screening, interviews, HR rounds)
5. Set logistics such as timeline, location, and resume ingestion method
6. Submit the drive to activate the application link

---

### What analytics does Hirekruit provide for recruitment drives?

**Documents Used**

* identity_and_governance.md
* conduct_and_scope.md
* dashboard_navigation.md
* analytics_pipeline.md
* ai_interviews.md

**Response**

Hirekruit provides funnel metrics, drop-off analysis, source performance tracking, and time-to-hire analytics through its Analytics dashboard.

---

## Summary

This RAG module enables SarthiChatBot to deliver **accurate, safe, and document-grounded responses** by combining:

* Explicit governance enforcement
* Semantic retrieval from internal documentation
* Structured context construction

It is designed to integrate cleanly with the broader Hirekruit backend and support real production usage.