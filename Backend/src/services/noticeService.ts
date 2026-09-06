import prisma from '../config/database';
import { NoticeStatus, Prisma } from '@prisma/client';

export class NoticeService {
  // ============ Get Notices ============

  async getNotices(schoolId: string, filters: any) {
    const {
      search,
      type,
      priority,
      status,
      isPublished,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = { schoolId };

    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleBangla: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { contentBangla: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' },
        ],
      }),
      prisma.notice.count({ where }),
    ]);

    const creatorIds = notices.flatMap((notice) => notice.createdBy ? [notice.createdBy] : []);
    const creators = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, role: true },
    });
    const creatorRoles = new Map(creators.map((creator) => [creator.id, creator.role]));

    return {
      notices: notices.map((notice) => ({
        ...notice,
        creatorRole: notice.createdBy ? creatorRoles.get(notice.createdBy) : undefined,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getPublishedNotices(schoolId: string, filters: any) {
    const { type, priority, limit = 10 } = filters;

    const where: any = {
      schoolId,
      isPublished: true,
      status: 'published',
      publishedAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;

    return prisma.notice.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: Number(limit),
    });
  }

  async getNotice(id: string, schoolId: string) {
    const notice = await prisma.notice.findFirst({
      where: { id, schoolId },
    });

    if (!notice) throw new Error('Notice not found');

    const creator = notice.createdBy
      ? await prisma.user.findFirst({ where: { id: notice.createdBy, schoolId }, select: { role: true } })
      : null;

    return {
      ...notice,
      creatorRole: creator?.role,
    };
  }

  // ============ Create Notice ============

  async createNotice(schoolId: string, data: any, createdBy: string) {
    const {
      title,
      titleBangla,
      content,
      contentBangla,
      type,
      priority,
      publishedAt,
      expiresAt,
      targetClasses,
      targetSections,
      attachments,
    } = data;

    // Determine status based on publish date
    let status: NoticeStatus = NoticeStatus.draft;
    let isPublished = false;

    if (publishedAt && new Date(publishedAt) <= new Date()) {
      status = NoticeStatus.published;
      isPublished = true;
    }

    return prisma.notice.create({
      data: {
        schoolId,
        title,
        titleBangla,
        content,
        contentBangla,
        type,
        priority,
        status,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        targetClasses: targetClasses || [],
        targetSections: targetSections || [],
        attachments: attachments || [],
        createdBy,
      },
    });
  }

  // ============ Update Notice ============

  async updateNotice(id: string, schoolId: string, data: any, requesterRole?: string) {
    const existing = await prisma.notice.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    if (requesterRole === 'teacher' && existing.createdBy) {
      const creator = await prisma.user.findFirst({
        where: { id: existing.createdBy, schoolId },
        select: { role: true },
      });
      if (creator?.role === 'school_admin') {
        throw new Error('Teachers cannot edit school admin notices');
      }
    }

    const {
      title,
      titleBangla,
      content,
      contentBangla,
      type,
      priority,
      publishedAt,
      expiresAt,
      targetClasses,
      targetSections,
      attachments,
    } = data;

    // Update status based on publish date
    let status = existing.status;
    let isPublished = existing.isPublished;

    if (publishedAt) {
      const pubDate = new Date(publishedAt);
      if (pubDate <= new Date()) {
        status = 'published';
        isPublished = true;
      } else {
        status = 'draft';
        isPublished = false;
      }
    }

    return prisma.notice.update({
      where: { id },
      data: {
        title,
        titleBangla,
        content,
        contentBangla,
        type,
        priority,
        status,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        targetClasses: targetClasses || [],
        targetSections: targetSections || [],
        attachments: attachments || [],
        updatedAt: new Date(),
      },
    });
  }

  // ============ Delete Notice ============

  async deleteNotice(id: string, schoolId: string) {
    const existing = await prisma.notice.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    return prisma.notice.delete({ where: { id } });
  }

  // ============ Publish/Unpublish ============

  async publishNotice(id: string, schoolId: string) {
    const existing = await prisma.notice.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    return prisma.notice.update({
      where: { id },
      data: {
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublishNotice(id: string, schoolId: string) {
    const existing = await prisma.notice.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    return prisma.notice.update({
      where: { id },
      data: {
        status: 'draft',
        isPublished: false,
        publishedAt: null,
      },
    });
  }

  // ============ Archive ============

  async archiveNotice(id: string, schoolId: string) {
    const existing = await prisma.notice.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    return prisma.notice.update({
      where: { id },
      data: {
        status: 'archived',
        isPublished: false,
      },
    });
  }

  // ============ Statistics ============

  async getStatistics(schoolId: string) {
    const [
      total,
      published,
      draft,
      archived,
      expired,
      byType,
      byPriority,
      recent,
    ] = await Promise.all([
      prisma.notice.count({ where: { schoolId } }),
      prisma.notice.count({ where: { schoolId, status: 'published' } }),
      prisma.notice.count({ where: { schoolId, status: 'draft' } }),
      prisma.notice.count({ where: { schoolId, status: 'archived' } }),
      prisma.notice.count({ where: { schoolId, status: 'expired' } }),
      prisma.notice.groupBy({
        by: ['type'],
        where: { schoolId },
        _count: true,
      }),
      prisma.notice.groupBy({
        by: ['priority'],
        where: { schoolId },
        _count: true,
      }),
      prisma.notice.findMany({
        where: {
          schoolId,
          status: 'published',
          isPublished: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      expired,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count,
      })),
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: item._count,
      })),
      recent,
    };
  }

  // ============ Attachments ============

  async uploadAttachment(noticeId: string, schoolId: string, file: any) {
    const existing = await prisma.notice.findFirst({
      where: { id: noticeId, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    // TODO: Upload file to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just store the filename
    const filename = `${Date.now()}-${file.originalname}`;
    const url = `/uploads/notices/${filename}`;

    const attachments = [...(existing.attachments || []), filename];

    await prisma.notice.update({
      where: { id: noticeId },
      data: { attachments },
    });

    return { url, filename };
  }

  async deleteAttachment(noticeId: string, filename: string, schoolId: string) {
    const existing = await prisma.notice.findFirst({
      where: { id: noticeId, schoolId },
    });
    if (!existing) throw new Error('Notice not found');

    const attachments = (existing.attachments || []).filter(f => f !== filename);

    return prisma.notice.update({
      where: { id: noticeId },
      data: { attachments },
    });
  }

  // ============ Auto-Expire ============

  async autoExpireNotices() {
    const expired = await prisma.notice.updateMany({
      where: {
        status: 'published',
        expiresAt: { lte: new Date() },
        isPublished: true,
      },
      data: {
        status: 'expired',
        isPublished: false,
      },
    });

    return { expired: expired.count };
  }
}

export default new NoticeService();