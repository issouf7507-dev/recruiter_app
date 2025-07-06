import { NextRequest, NextResponse } from "next/server";
import { kanbanEvents } from "@/lib/socket";

export async function GET(req: NextRequest) {
  try {
    // Cette route peut être utilisée pour vérifier l'état du WebSocket
    return NextResponse.json({
      success: true,
      message: "WebSocket endpoint ready",
      events: Object.keys(kanbanEvents),
    });
  } catch (error) {
    console.error("Erreur WebSocket:", error);
    return NextResponse.json({ error: "Erreur WebSocket" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, data, offerId } = body;

    if (!eventType || !offerId) {
      return NextResponse.json(
        { error: "eventType et offerId sont requis" },
        { status: 400 }
      );
    }

    // Traitement des événements WebSocket selon le type
    switch (eventType) {
      case "column:created":
        await kanbanEvents.columnCreated(data.column, offerId);
        break;
      case "column:updated":
        await kanbanEvents.columnUpdated(data.column, offerId);
        break;
      case "column:deleted":
        await kanbanEvents.columnDeleted(data.columnId, offerId);
        break;
      case "column:reordered":
        await kanbanEvents.columnsReordered(data.columns, offerId);
        break;
      case "application:moved":
        await kanbanEvents.applicationMoved(
          data.applicationId,
          data.newColumnId,
          offerId,
          data.application
        );
        break;
      case "application:updated":
        await kanbanEvents.applicationUpdated(
          data.applicationId,
          offerId,
          data.application
        );
        break;
      case "note:added":
        await kanbanEvents.noteAdded(data.applicationId, data.note, offerId);
        break;
      case "note:updated":
        await kanbanEvents.noteUpdated(data.applicationId, data.note, offerId);
        break;
      case "checklist:item:added":
        await kanbanEvents.checklistItemAdded(
          data.applicationId,
          data.item,
          offerId
        );
        break;
      case "checklist:item:updated":
        await kanbanEvents.checklistItemUpdated(
          data.applicationId,
          data.item,
          offerId
        );
        break;
      case "checklist:item:deleted":
        await kanbanEvents.checklistItemDeleted(
          data.applicationId,
          data.itemId,
          offerId
        );
        break;
      case "collaborator:assigned":
        await kanbanEvents.collaboratorAssigned(
          data.applicationId,
          data.collaborateur,
          offerId
        );
        break;
      case "collaborator:unassigned":
        await kanbanEvents.collaboratorUnassigned(
          data.applicationId,
          data.collaborateurId,
          offerId
        );
        break;
      case "attachment:added":
        await kanbanEvents.attachmentAdded(
          data.applicationId,
          data.file,
          offerId
        );
        break;
      case "attachment:deleted":
        await kanbanEvents.attachmentDeleted(
          data.applicationId,
          data.fileId,
          offerId
        );
        break;
      case "duedate:updated":
        await kanbanEvents.duedateUpdated(
          data.applicationId,
          data.duedate,
          offerId
        );
        break;
      default:
        return NextResponse.json(
          { error: `Type d'événement non reconnu: ${eventType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Événement ${eventType} traité avec succès`,
    });
  } catch (error) {
    console.error("Erreur traitement événement:", error);
    return NextResponse.json(
      { error: "Erreur traitement événement" },
      { status: 500 }
    );
  }
}
