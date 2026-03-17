import { FastifyPluginAsync } from "fastify";
import { ContactModel } from "@repo/db";
import {
  CreateContactSchema,
  UpdateContactSchema,
  ContactQuerySchema,
} from "@repo/types";
import { requireAuth } from "../../middleware/auth.middleware.js";

const contactsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", requireAuth);

  // GET /contacts - Get all contacts with filtering
  fastify.get("/", async (request) => {
    const { userId, orgId } = request.auth;
    const query = ContactQuerySchema.parse(request.query);

    const { agentId, status, tag, search, limit, offset } = query;

    // Build filter
    const filter: any = { userId, orgId: orgId || null };

    if (agentId) {
      filter.agentId = agentId;
    }

    if (status) {
      filter.status = status;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await ContactModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit || "50"))
      .skip(parseInt(offset || "0"));

    return contacts;
  });

  // GET /contacts/:id - Get single contact
  fastify.get("/:id", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { id } = request.params as { id: string };

    const contact = await ContactModel.findOne({
      _id: id,
      userId,
      orgId: orgId || null,
    });

    if (!contact) {
      return reply.status(404).send({ error: "Contact not found" });
    }

    return contact;
  });

  // POST /contacts - Create contact
  fastify.post("/", async (request, reply) => {
    const { userId, orgId } = request.auth;

    // Validation
    const data = CreateContactSchema.parse(request.body);

    const contact = await ContactModel.create({
      ...data,
      userId: userId!,
      orgId: orgId || null,
    });

    return reply.status(201).send(contact);
  });

  // PUT /contacts/:id - Update contact
  fastify.put("/:id", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { id } = request.params as { id: string };

    const data = UpdateContactSchema.parse(request.body);

    const contact = await ContactModel.findOneAndUpdate(
      { _id: id, userId, orgId: orgId || null },
      data,
      { new: true },
    );

    if (!contact) {
      return reply.status(404).send({ error: "Contact not found" });
    }

    return contact;
  });

  // DELETE /contacts/:id - Delete contact
  fastify.delete("/:id", async (request, reply) => {
    const { userId, orgId } = request.auth;
    const { id } = request.params as { id: string };

    const contact = await ContactModel.findOneAndDelete({
      _id: id,
      userId,
      orgId: orgId || null,
    });

    if (!contact) {
      return reply.status(404).send({ error: "Contact not found" });
    }

    return reply.status(204).send();
  });
};

export default contactsRoutes;
