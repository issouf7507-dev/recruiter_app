
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  password: 'password',
  image: 'image',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CandidatScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  nom: 'nom',
  prenom: 'prenom',
  telephone: 'telephone',
  cv: 'cv',
  letterm: 'letterm',
  email: 'email',
  bio: 'bio',
  adresse: 'adresse',
  ville: 'ville',
  statut: 'statut',
  pays: 'pays',
  dateNaissance: 'dateNaissance',
  nationalite: 'nationalite',
  situationFamiliale: 'situationFamiliale',
  permisConduire: 'permisConduire',
  image: 'image'
};

exports.Prisma.RecruteurScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  entreprise: 'entreprise',
  description: 'description',
  name: 'name',
  logo: 'logo',
  industry: 'industry',
  size: 'size',
  location: 'location',
  website: 'website',
  email: 'email',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CandidatCompetenceScalarFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  competence: 'competence',
  createdAt: 'createdAt'
};

exports.Prisma.CompanySocialScalarFieldEnum = {
  id: 'id',
  linkedin: 'linkedin',
  twitter: 'twitter',
  recruteurId: 'recruteurId'
};

exports.Prisma.InvitationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  recruteurId: 'recruteurId',
  role: 'role',
  token: 'token',
  accepted: 'accepted',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.CollaborateurScalarFieldEnum = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  role: 'role',
  recruteurId: 'recruteurId',
  invitationId: 'invitationId',
  userId: 'userId',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationCollaborateurScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  collaborateurId: 'collaborateurId',
  assignedAt: 'assignedAt',
  assignedBy: 'assignedBy'
};

exports.Prisma.JobOfferScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  company: 'company',
  location: 'location',
  type: 'type',
  etat: 'etat',
  experience: 'experience',
  salaryMin: 'salaryMin',
  salaryMax: 'salaryMax',
  salaryCurrency: 'salaryCurrency',
  salaryPeriod: 'salaryPeriod',
  benefits: 'benefits',
  requirements: 'requirements',
  responsibilities: 'responsibilities',
  duedate: 'duedate',
  skills: 'skills',
  favorite: 'favorite',
  templateId: 'templateId',
  views: 'views',
  recruteurId: 'recruteurId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobOfferCompetenceScalarFieldEnum = {
  id: 'id',
  jobOfferId: 'jobOfferId',
  competence: 'competence',
  createdAt: 'createdAt'
};

exports.Prisma.OfferTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  content: 'content',
  recruteurId: 'recruteurId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  jobOfferId: 'jobOfferId',
  columnId: 'columnId',
  rating: 'rating',
  message: 'message',
  cv: 'cv',
  favorite: 'favorite',
  duedate: 'duedate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationNoteScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  content: 'content',
  authorId: 'authorId',
  authorName: 'authorName',
  authorType: 'authorType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChecklistItemScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  title: 'title',
  description: 'description',
  isCompleted: 'isCompleted',
  createdById: 'createdById',
  createdByType: 'createdByType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationFileScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  fileSize: 'fileSize',
  uploadedById: 'uploadedById',
  uploadedByType: 'uploadedByType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KanbanColumnScalarFieldEnum = {
  id: 'id',
  color: 'color',
  name: 'name',
  order: 'order',
  isDefault: 'isDefault',
  jobOfferId: 'jobOfferId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.ExperienceScalarFieldEnum = {
  id: 'id',
  poste: 'poste',
  entreprise: 'entreprise',
  localisation: 'localisation',
  typeContrat: 'typeContrat',
  dateDebut: 'dateDebut',
  dateFin: 'dateFin',
  description: 'description',
  candidatId: 'candidatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExperienceCompetenceScalarFieldEnum = {
  id: 'id',
  experienceId: 'experienceId',
  competence: 'competence',
  createdAt: 'createdAt'
};

exports.Prisma.FormationScalarFieldEnum = {
  id: 'id',
  diplome: 'diplome',
  etablissement: 'etablissement',
  domaine: 'domaine',
  dateDebut: 'dateDebut',
  dateFin: 'dateFin',
  description: 'description',
  candidatId: 'candidatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FormationEtapeScalarFieldEnum = {
  id: 'id',
  formationId: 'formationId',
  etape: 'etape',
  createdAt: 'createdAt'
};

exports.Prisma.CompetenceScalarFieldEnum = {
  id: 'id',
  categorie: 'categorie',
  nom: 'nom',
  niveau: 'niveau',
  candidatId: 'candidatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ObjectifCarriereScalarFieldEnum = {
  id: 'id',
  titre: 'titre',
  description: 'description',
  categorie: 'categorie',
  dateLimite: 'dateLimite',
  progression: 'progression',
  candidatId: 'candidatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ObjectifEtapeScalarFieldEnum = {
  id: 'id',
  objectifId: 'objectifId',
  etape: 'etape',
  createdAt: 'createdAt'
};

exports.Prisma.AlerteEmploiScalarFieldEnum = {
  id: 'id',
  titre: 'titre',
  localisation: 'localisation',
  typeContrat: 'typeContrat',
  salaireMin: 'salaireMin',
  salaireMax: 'salaireMax',
  experience: 'experience',
  frequence: 'frequence',
  active: 'active',
  derniereMiseAJour: 'derniereMiseAJour',
  nombreResultats: 'nombreResultats',
  candidatId: 'candidatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AlerteMotCleScalarFieldEnum = {
  id: 'id',
  alerteId: 'alerteId',
  motCle: 'motCle',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  titre: 'titre',
  message: 'message',
  type: 'type',
  lu: 'lu',
  candidatId: 'candidatId',
  offreId: 'offreId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  jobOfferId: 'jobOfferId',
  candidatId: 'candidatId',
  recruteurId: 'recruteurId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  senderType: 'senderType',
  content: 'content',
  isRead: 'isRead',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KanbanColumnCustomScalarFieldEnum = {
  id: 'id',
  color: 'color',
  name: 'name',
  order: 'order',
  isDefault: 'isDefault',
  jobOfferId: 'jobOfferId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  recruteurId: 'recruteurId',
  applicationsCustomid: 'applicationsCustomid'
};

exports.Prisma.CollaborateurCustomScalarFieldEnum = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  role: 'role',
  recruteurId: 'recruteurId',
  invitationId: 'invitationId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationFileCustomScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  fileSize: 'fileSize',
  uploadedById: 'uploadedById',
  uploadedByType: 'uploadedByType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationCollaborateurCustomScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  collaborateurId: 'collaborateurId',
  assignedAt: 'assignedAt',
  assignedBy: 'assignedBy'
};

exports.Prisma.ApplicationNoteCustomScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  content: 'content',
  authorId: 'authorId',
  authorName: 'authorName',
  authorType: 'authorType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChecklistItemCustomScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  title: 'title',
  description: 'description',
  isCompleted: 'isCompleted',
  createdById: 'createdById',
  createdByType: 'createdByType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CandidatCustomScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  cv: 'cv',
  cvUrl: 'cvUrl',
  applicationId: 'applicationId'
};

exports.Prisma.CandidatDocumentScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  fileSize: 'fileSize',
  candidatId: 'candidatId'
};

exports.Prisma.ApplicationCustomScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  company: 'company',
  location: 'location',
  duedate: 'duedate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  kanbanColumnCustomid: 'kanbanColumnCustomid'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CVTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  layout: 'layout',
  colors: 'colors',
  fonts: 'fonts',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CVScalarFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  templateId: 'templateId',
  title: 'title',
  isPublic: 'isPublic',
  lastExportedAt: 'lastExportedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CVPersonalInfoScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  firstName: 'firstName',
  lastName: 'lastName',
  jobTitle: 'jobTitle',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  postalCode: 'postalCode',
  country: 'country',
  dateOfBirth: 'dateOfBirth',
  nationality: 'nationality',
  maritalStatus: 'maritalStatus',
  drivingLicense: 'drivingLicense',
  website: 'website',
  linkedin: 'linkedin',
  github: 'github',
  portfolio: 'portfolio',
  profileImage: 'profileImage',
  summary: 'summary'
};

exports.Prisma.CVExperienceScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  position: 'position',
  company: 'company',
  location: 'location',
  contractType: 'contractType',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  description: 'description',
  achievements: 'achievements',
  skills: 'skills',
  order: 'order'
};

exports.Prisma.CVEducationScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  degree: 'degree',
  institution: 'institution',
  field: 'field',
  location: 'location',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  description: 'description',
  grade: 'grade',
  honors: 'honors',
  order: 'order'
};

exports.Prisma.CVSkillScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  category: 'category',
  level: 'level',
  order: 'order'
};

exports.Prisma.CVLanguageScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  level: 'level',
  certification: 'certification',
  order: 'order'
};

exports.Prisma.CVInterestScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  description: 'description',
  order: 'order'
};

exports.Prisma.CVCustomSectionScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  title: 'title',
  content: 'content',
  order: 'order'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  image: 'image'
};

exports.Prisma.CandidatOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  nom: 'nom',
  prenom: 'prenom',
  telephone: 'telephone',
  cv: 'cv',
  letterm: 'letterm',
  email: 'email',
  bio: 'bio',
  adresse: 'adresse',
  ville: 'ville',
  statut: 'statut',
  pays: 'pays',
  nationalite: 'nationalite',
  situationFamiliale: 'situationFamiliale',
  permisConduire: 'permisConduire',
  image: 'image'
};

exports.Prisma.RecruteurOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  entreprise: 'entreprise',
  description: 'description',
  name: 'name',
  logo: 'logo',
  industry: 'industry',
  size: 'size',
  location: 'location',
  website: 'website',
  email: 'email',
  phone: 'phone'
};

exports.Prisma.CandidatCompetenceOrderByRelevanceFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  competence: 'competence'
};

exports.Prisma.CompanySocialOrderByRelevanceFieldEnum = {
  id: 'id',
  linkedin: 'linkedin',
  twitter: 'twitter',
  recruteurId: 'recruteurId'
};

exports.Prisma.InvitationOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  recruteurId: 'recruteurId',
  token: 'token'
};

exports.Prisma.CollaborateurOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  recruteurId: 'recruteurId',
  invitationId: 'invitationId',
  userId: 'userId'
};

exports.Prisma.ApplicationCollaborateurOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  collaborateurId: 'collaborateurId',
  assignedBy: 'assignedBy'
};

exports.Prisma.JobOfferOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  company: 'company',
  location: 'location',
  type: 'type',
  etat: 'etat',
  experience: 'experience',
  salaryCurrency: 'salaryCurrency',
  salaryPeriod: 'salaryPeriod',
  benefits: 'benefits',
  requirements: 'requirements',
  responsibilities: 'responsibilities',
  skills: 'skills',
  recruteurId: 'recruteurId'
};

exports.Prisma.JobOfferCompetenceOrderByRelevanceFieldEnum = {
  id: 'id',
  jobOfferId: 'jobOfferId',
  competence: 'competence'
};

exports.Prisma.OfferTemplateOrderByRelevanceFieldEnum = {
  name: 'name',
  description: 'description',
  content: 'content',
  recruteurId: 'recruteurId'
};

exports.Prisma.ApplicationOrderByRelevanceFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  jobOfferId: 'jobOfferId',
  columnId: 'columnId',
  message: 'message',
  cv: 'cv'
};

exports.Prisma.ApplicationNoteOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  content: 'content',
  authorId: 'authorId',
  authorName: 'authorName',
  authorType: 'authorType'
};

exports.Prisma.ChecklistItemOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  title: 'title',
  description: 'description',
  createdById: 'createdById',
  createdByType: 'createdByType'
};

exports.Prisma.ApplicationFileOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  uploadedById: 'uploadedById',
  uploadedByType: 'uploadedByType'
};

exports.Prisma.KanbanColumnOrderByRelevanceFieldEnum = {
  id: 'id',
  color: 'color',
  name: 'name',
  jobOfferId: 'jobOfferId'
};

exports.Prisma.SessionOrderByRelevanceFieldEnum = {
  id: 'id',
  token: 'token',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
};

exports.Prisma.AccountOrderByRelevanceFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  scope: 'scope',
  password: 'password'
};

exports.Prisma.VerificationTokenOrderByRelevanceFieldEnum = {
  identifier: 'identifier',
  token: 'token'
};

exports.Prisma.ExperienceOrderByRelevanceFieldEnum = {
  id: 'id',
  poste: 'poste',
  entreprise: 'entreprise',
  localisation: 'localisation',
  typeContrat: 'typeContrat',
  description: 'description',
  candidatId: 'candidatId'
};

exports.Prisma.ExperienceCompetenceOrderByRelevanceFieldEnum = {
  id: 'id',
  experienceId: 'experienceId',
  competence: 'competence'
};

exports.Prisma.FormationOrderByRelevanceFieldEnum = {
  id: 'id',
  diplome: 'diplome',
  etablissement: 'etablissement',
  domaine: 'domaine',
  description: 'description',
  candidatId: 'candidatId'
};

exports.Prisma.FormationEtapeOrderByRelevanceFieldEnum = {
  id: 'id',
  formationId: 'formationId',
  etape: 'etape'
};

exports.Prisma.CompetenceOrderByRelevanceFieldEnum = {
  id: 'id',
  categorie: 'categorie',
  nom: 'nom',
  candidatId: 'candidatId'
};

exports.Prisma.ObjectifCarriereOrderByRelevanceFieldEnum = {
  id: 'id',
  titre: 'titre',
  description: 'description',
  categorie: 'categorie',
  candidatId: 'candidatId'
};

exports.Prisma.ObjectifEtapeOrderByRelevanceFieldEnum = {
  id: 'id',
  objectifId: 'objectifId',
  etape: 'etape'
};

exports.Prisma.AlerteEmploiOrderByRelevanceFieldEnum = {
  id: 'id',
  titre: 'titre',
  localisation: 'localisation',
  typeContrat: 'typeContrat',
  experience: 'experience',
  frequence: 'frequence',
  candidatId: 'candidatId'
};

exports.Prisma.AlerteMotCleOrderByRelevanceFieldEnum = {
  id: 'id',
  alerteId: 'alerteId',
  motCle: 'motCle'
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  id: 'id',
  titre: 'titre',
  message: 'message',
  type: 'type',
  candidatId: 'candidatId'
};

exports.Prisma.ConversationOrderByRelevanceFieldEnum = {
  id: 'id',
  jobOfferId: 'jobOfferId',
  candidatId: 'candidatId',
  recruteurId: 'recruteurId'
};

exports.Prisma.MessageOrderByRelevanceFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  content: 'content'
};

exports.Prisma.KanbanColumnCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  color: 'color',
  name: 'name',
  recruteurId: 'recruteurId',
  applicationsCustomid: 'applicationsCustomid'
};

exports.Prisma.CollaborateurCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  recruteurId: 'recruteurId',
  invitationId: 'invitationId',
  userId: 'userId'
};

exports.Prisma.ApplicationFileCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  uploadedById: 'uploadedById',
  uploadedByType: 'uploadedByType'
};

exports.Prisma.ApplicationCollaborateurCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  collaborateurId: 'collaborateurId',
  assignedBy: 'assignedBy'
};

exports.Prisma.ApplicationNoteCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  content: 'content',
  authorId: 'authorId',
  authorName: 'authorName',
  authorType: 'authorType'
};

exports.Prisma.ChecklistItemCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  title: 'title',
  description: 'description',
  createdById: 'createdById',
  createdByType: 'createdByType'
};

exports.Prisma.CandidatCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  cv: 'cv',
  cvUrl: 'cvUrl',
  applicationId: 'applicationId'
};

exports.Prisma.CandidatDocumentOrderByRelevanceFieldEnum = {
  id: 'id',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  candidatId: 'candidatId'
};

exports.Prisma.ApplicationCustomOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  company: 'company',
  location: 'location',
  kanbanColumnCustomid: 'kanbanColumnCustomid'
};

exports.Prisma.VerificationOrderByRelevanceFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.CVTemplateOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  layout: 'layout'
};

exports.Prisma.CVOrderByRelevanceFieldEnum = {
  id: 'id',
  candidatId: 'candidatId',
  templateId: 'templateId',
  title: 'title'
};

exports.Prisma.CVPersonalInfoOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  firstName: 'firstName',
  lastName: 'lastName',
  jobTitle: 'jobTitle',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  postalCode: 'postalCode',
  country: 'country',
  nationality: 'nationality',
  maritalStatus: 'maritalStatus',
  drivingLicense: 'drivingLicense',
  website: 'website',
  linkedin: 'linkedin',
  github: 'github',
  portfolio: 'portfolio',
  profileImage: 'profileImage',
  summary: 'summary'
};

exports.Prisma.CVExperienceOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  position: 'position',
  company: 'company',
  location: 'location',
  contractType: 'contractType',
  description: 'description',
  achievements: 'achievements',
  skills: 'skills'
};

exports.Prisma.CVEducationOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  degree: 'degree',
  institution: 'institution',
  field: 'field',
  location: 'location',
  description: 'description',
  grade: 'grade',
  honors: 'honors'
};

exports.Prisma.CVSkillOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  category: 'category'
};

exports.Prisma.CVLanguageOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  level: 'level',
  certification: 'certification'
};

exports.Prisma.CVInterestOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  description: 'description'
};

exports.Prisma.CVCustomSectionOrderByRelevanceFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  title: 'title',
  content: 'content'
};
exports.UserType = exports.$Enums.UserType = {
  CANDIDAT: 'CANDIDAT',
  RECRUTEUR: 'RECRUTEUR',
  COLLABORATEUR: 'COLLABORATEUR'
};

exports.RecruteurType = exports.$Enums.RecruteurType = {
  PARTICULIER: 'PARTICULIER',
  ENTREPRISE: 'ENTREPRISE',
  ENTITE: 'ENTITE'
};

exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
  VIEWER: 'VIEWER'
};

exports.SenderType = exports.$Enums.SenderType = {
  CANDIDAT: 'CANDIDAT',
  RECRUTEUR: 'RECRUTEUR'
};

exports.Prisma.ModelName = {
  User: 'User',
  Candidat: 'Candidat',
  Recruteur: 'Recruteur',
  CandidatCompetence: 'CandidatCompetence',
  CompanySocial: 'CompanySocial',
  Invitation: 'Invitation',
  Collaborateur: 'Collaborateur',
  ApplicationCollaborateur: 'ApplicationCollaborateur',
  JobOffer: 'JobOffer',
  JobOfferCompetence: 'JobOfferCompetence',
  OfferTemplate: 'OfferTemplate',
  Application: 'Application',
  ApplicationNote: 'ApplicationNote',
  ChecklistItem: 'ChecklistItem',
  ApplicationFile: 'ApplicationFile',
  KanbanColumn: 'KanbanColumn',
  Session: 'Session',
  Account: 'Account',
  VerificationToken: 'VerificationToken',
  Experience: 'Experience',
  ExperienceCompetence: 'ExperienceCompetence',
  Formation: 'Formation',
  FormationEtape: 'FormationEtape',
  Competence: 'Competence',
  ObjectifCarriere: 'ObjectifCarriere',
  ObjectifEtape: 'ObjectifEtape',
  AlerteEmploi: 'AlerteEmploi',
  AlerteMotCle: 'AlerteMotCle',
  Notification: 'Notification',
  Conversation: 'Conversation',
  Message: 'Message',
  KanbanColumnCustom: 'KanbanColumnCustom',
  CollaborateurCustom: 'CollaborateurCustom',
  ApplicationFileCustom: 'ApplicationFileCustom',
  ApplicationCollaborateurCustom: 'ApplicationCollaborateurCustom',
  ApplicationNoteCustom: 'ApplicationNoteCustom',
  ChecklistItemCustom: 'ChecklistItemCustom',
  CandidatCustom: 'CandidatCustom',
  CandidatDocument: 'CandidatDocument',
  ApplicationCustom: 'ApplicationCustom',
  Verification: 'Verification',
  CVTemplate: 'CVTemplate',
  CV: 'CV',
  CVPersonalInfo: 'CVPersonalInfo',
  CVExperience: 'CVExperience',
  CVEducation: 'CVEducation',
  CVSkill: 'CVSkill',
  CVLanguage: 'CVLanguage',
  CVInterest: 'CVInterest',
  CVCustomSection: 'CVCustomSection'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
