"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, ArrowLeft, Pencil, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { deleteData, fetchData, postData, putData } from "@/utils/utilts";
import { useQuery } from "@tanstack/react-query";
import { offerTemplate } from "@/types/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Schéma de validation pour le modèle d'offre
const templateFormSchema = z.object({
  name: z.string().min(1, "Le nom du modèle est requis"),
  description: z.string().min(1, "La description est requise"),
  content: z.string().min(1, "Le contenu du modèle est requis"),
});

// Type pour les modèles d'offres

export default function ModelesOffres() {
  const { user } = useAuth();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<offerTemplate | null>(
    null
  );
  const [templateToDelete, setTemplateToDelete] =
    useState<offerTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [delAlerte, setDelAlerte] = useState(false);

  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
    },
  });

  const handleEdit = (template: offerTemplate) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      description: template.description,
      content: template.content,
    });
    setIsCreating(true);
  };

  const handleDelete = async (template: offerTemplate) => {
    try {
      setIsSubmitting(true);
      await deleteData(`/api/recruteur/moffres/${template.id}`).then((res) => {
        if (res.success) {
          query.refetch();
          setDelAlerte(false);
          toast("Super ! Vous venez de supprimer ce modèle.");
          setTemplateToDelete(null);
          // Rafraîchir la liste des templates
        }
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsSubmitting(false);
      // setDelAlerte(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof templateFormSchema>) => {
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        const newdata = { ...data, recruteurId: user?.id };
        await putData(
          newdata,
          `/api/recruteur/moffres/${editingTemplate.id}`
        ).then((res) => {
          if (res.success) {
            setIsCreating(false);
            toast("Super ! Vous venez de modifier ce modèle.");
            // console.log("ss");
          }
        });
      } else {
        const newdata = { ...data, recruteurId: user?.id };
        await postData(newdata, "/api/recruteur/moffres").then((res) => {
          if (res.success) {
            setIsCreating(false);
            toast("Super ! Vous venez de créer un nouveau modèle.");
          }
        });
      }
      setIsCreating(false);
      setEditingTemplate(null);
      form.reset();
      query.refetch();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const query = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetchData("/api/recruteur/moffres"),
  });

  // console.log(query?.data.data);

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/mesoffres">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Modèles d'offres</h1>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={editingTemplate ? true : false}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate
                ? "Modifier le modèle"
                : "Créer un nouveau modèle"}
            </CardTitle>
            <CardDescription>
              {editingTemplate
                ? "Modifiez le modèle existant"
                : "Créez un modèle d'offre réutilisable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du modèle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex: Offre Développeur Full Stack"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description du modèle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu du modèle</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contenu du modèle..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      form.reset({
                        name: "",
                        description: "",
                        content: "",
                      });
                      setIsCreating(false);
                      setEditingTemplate(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingTemplate ? "Modification..." : "Création..."}
                      </>
                    ) : editingTemplate ? (
                      "Modifier"
                    ) : (
                      "Créer le modèle"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {query?.data?.data?.length === 0 ? (
            <div className="h-[80vh] flex items-center justify-center">
              <Card className="w-96 text-center shadow-none">
                <CardHeader className="flex flex-col items-center gap-2">
                  <Lock className="w-10 h-10 text-primary" />
                  <CardTitle>Pas de data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p> Aucun modèle n'a été créé pour le moment.</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    onClick={() => setIsCreating(true)}
                    // asChild
                    variant="link"
                  >
                    Nouveau Modèle
                  </Button>
                </CardFooter>
              </Card>
              <div></div>
            </div>
          ) : (
            query?.data?.data?.map((template: offerTemplate) => (
              <Card
                key={template.id}
                className="group relative transition-all duration-300 hover:h-auto hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-[500px] transition-all duration-300">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {template.content}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setDelAlerte(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <AlertDialog open={delAlerte} onOpenChange={setDelAlerte}>
                    {/* <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setTemplateToDelete(template)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger> */}
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le modèle sera
                          définitivement supprimé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(template)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isSubmitting ? "Suppressi.." : "Supprimer"}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
