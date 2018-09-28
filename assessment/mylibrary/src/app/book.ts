export interface Book{
    id: number;
    author_firstname: string;
    author_lastname: string;
    title: string;
    cover_thumbnail: string;
    modified_date: Date;
    created_date: Date;
    is_deleted: number;
}